import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'questionBank';

export const QUESTION_TYPES = {
  MCQ: 'mcq',
  CODING: 'coding',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay'
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

/**
 * Question Bank Model - Reusable question library for faculty
 */
export class QuestionBank {
  /**
   * Create a new question in the bank
   */
  static async create(questionData) {
    const db = getFirestore();
    const questionRef = db.collection(COLLECTION_NAME).doc();
    
    const question = {
      _id: questionRef.id,
      
      // Basic Info
      type: questionData.type, // mcq, coding, short_answer, essay
      title: questionData.title || '', // Short title for identification
      prompt: questionData.prompt, // The actual question
      
      // Organization
      subjectId: questionData.subjectId,
      topics: questionData.topics || [], // Array of topic tags
      difficulty: questionData.difficulty || DIFFICULTY_LEVELS.MEDIUM,
      
      // Question-specific fields
      // For MCQ
      options: questionData.options || [], // Array of option strings
      correctOptionIndex: questionData.correctOptionIndex !== undefined ? questionData.correctOptionIndex : null,
      
      // For Coding
      language: questionData.language || null, // 'javascript', 'python'
      starterCode: questionData.starterCode || '',
      solution: questionData.solution || '', // Reference solution
      testCases: questionData.testCases || [], // Array of test cases
      
      // Metadata
      marks: questionData.marks || 1,
      estimatedTimeMinutes: questionData.estimatedTimeMinutes || 5,
      hints: questionData.hints || [], // Array of hints
      explanation: questionData.explanation || '', // Explanation of correct answer
      
      // Usage tracking
      timesUsed: 0,
      averageScore: null,
      
      // Ownership
      createdBy: questionData.createdBy,
      isPublic: questionData.isPublic || false, // Can other faculty use it?
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      
      // Tags for search
      tags: questionData.tags || [],
      
      // Status
      isActive: true
    };
    
    await questionRef.set(question);
    return { ...question, id: questionRef.id };
  }

  /**
   * Find a question by ID
   */
  static async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  /**
   * Find questions with filters
   */
  static async find(query = {}, options = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    // Filter by subject
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    
    // Filter by creator (faculty can see their own + public)
    if (query.createdBy) {
      // This is complex - need to handle OR logic
      // For now, just filter by creator
      queryRef = queryRef.where('createdBy', '==', query.createdBy);
    }
    
    // Filter by type
    if (query.type) {
      queryRef = queryRef.where('type', '==', query.type);
    }
    
    // Filter by difficulty
    if (query.difficulty) {
      queryRef = queryRef.where('difficulty', '==', query.difficulty);
    }
    
    // Filter by active status
    if (query.isActive !== undefined) {
      queryRef = queryRef.where('isActive', '==', query.isActive);
    }
    
    // Filter by public status
    if (query.isPublic !== undefined) {
      queryRef = queryRef.where('isPublic', '==', query.isPublic);
    }
    
    // Apply limit
    if (options.limit) {
      queryRef = queryRef.limit(options.limit);
    }
    
    // Order by created date (newest first)
    queryRef = queryRef.orderBy('createdAt', 'desc');
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Get questions accessible to a faculty member (own + public)
   */
  static async findAccessible(facultyId, filters = {}) {
    const db = getFirestore();
    
    // Get user's own questions
    const ownQuestions = await this.find({ 
      createdBy: facultyId,
      isActive: true,
      ...filters 
    });
    
    // Get public questions from others
    const publicQuestions = await this.find({ 
      isPublic: true,
      isActive: true,
      ...filters 
    }).then(questions => 
      questions.filter(q => q.createdBy !== facultyId)
    );
    
    // Combine and sort by created date
    const allQuestions = [...ownQuestions, ...publicQuestions];
    allQuestions.sort((a, b) => {
      const dateA = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const dateB = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
    
    return allQuestions;
  }

  /**
   * Search questions by text
   */
  static async search(searchText, filters = {}) {
    // Get all questions with filters
    const questions = await this.find(filters);
    
    // Filter by search text (case-insensitive)
    const searchLower = searchText.toLowerCase();
    
    return questions.filter(q => {
      const titleMatch = q.title?.toLowerCase().includes(searchLower);
      const promptMatch = q.prompt?.toLowerCase().includes(searchLower);
      const tagMatch = q.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      const topicMatch = q.topics?.some(topic => topic.toLowerCase().includes(searchLower));
      
      return titleMatch || promptMatch || tagMatch || topicMatch;
    });
  }

  /**
   * Update a question
   */
  static async updateById(id, updates) {
    const db = getFirestore();
    const questionRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.timesUsed;
    
    await questionRef.update(updateData);
    
    const doc = await questionRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  /**
   * Soft delete a question
   */
  static async deleteById(id) {
    return await this.updateById(id, { isActive: false });
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(questionId) {
    const db = getFirestore();
    const questionRef = db.collection(COLLECTION_NAME).doc(questionId);
    const question = await this.findById(questionId);
    
    if (question) {
      await questionRef.update({
        timesUsed: (question.timesUsed || 0) + 1
      });
    }
  }

  /**
   * Update average score for a question
   */
  static async updateAverageScore(questionId, newScore) {
    const question = await this.findById(questionId);
    
    if (question) {
      const currentAvg = question.averageScore || 0;
      const timesUsed = question.timesUsed || 0;
      
      // Calculate new average
      const newAverage = timesUsed === 0 
        ? newScore 
        : ((currentAvg * timesUsed) + newScore) / (timesUsed + 1);
      
      await this.updateById(questionId, {
        averageScore: Math.round(newAverage * 100) / 100 // Round to 2 decimals
      });
    }
  }

  /**
   * Duplicate a question (for templates)
   */
  static async duplicate(questionId, createdBy, options = {}) {
    const original = await this.findById(questionId);
    
    if (!original) {
      throw new Error('Question not found');
    }
    
    // Create a copy
    const duplicateData = {
      ...original,
      title: options.title || `${original.title} (Copy)`,
      createdBy,
      isPublic: options.isPublic !== undefined ? options.isPublic : false,
      timesUsed: 0,
      averageScore: null
    };
    
    // Remove original ID and timestamps
    delete duplicateData._id;
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    return await this.create(duplicateData);
  }

  /**
   * Get statistics for a subject
   */
  static async getSubjectStats(subjectId) {
    const questions = await this.find({ subjectId, isActive: true });
    
    return {
      totalQuestions: questions.length,
      byType: {
        mcq: questions.filter(q => q.type === QUESTION_TYPES.MCQ).length,
        coding: questions.filter(q => q.type === QUESTION_TYPES.CODING).length,
        shortAnswer: questions.filter(q => q.type === QUESTION_TYPES.SHORT_ANSWER).length,
        essay: questions.filter(q => q.type === QUESTION_TYPES.ESSAY).length
      },
      byDifficulty: {
        easy: questions.filter(q => q.difficulty === DIFFICULTY_LEVELS.EASY).length,
        medium: questions.filter(q => q.difficulty === DIFFICULTY_LEVELS.MEDIUM).length,
        hard: questions.filter(q => q.difficulty === DIFFICULTY_LEVELS.HARD).length
      },
      averageMarks: questions.length > 0
        ? questions.reduce((sum, q) => sum + (q.marks || 0), 0) / questions.length
        : 0
    };
  }

  /**
   * Populate question with subject details
   */
  static async populate(question, field) {
    if (!question) return question;
    
    if (field === 'subjectId' && question.subjectId) {
      const { Subject } = await import('./Subject.js');
      question.subject = await Subject.findById(question.subjectId);
    }
    
    if (field === 'createdBy' && question.createdBy) {
      const { User } = await import('./User.js');
      question.creator = await User.findById(question.createdBy);
    }
    
    return question;
  }
}
