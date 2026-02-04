import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'examTemplates';

/**
 * Exam Template Model - Reusable exam configurations
 */
export class ExamTemplate {
  static async create(templateData) {
    const db = getFirestore();
    const templateRef = db.collection(COLLECTION_NAME).doc();
    
    const template = {
      _id: templateRef.id,
      
      // Basic Info
      name: templateData.name,
      description: templateData.description || '',
      
      // Exam Configuration
      type: templateData.type, // 'mcq', 'quiz', 'coding'
      subjectId: templateData.subjectId,
      durationMinutes: templateData.durationMinutes,
      totalMarks: templateData.totalMarks,
      
      // Questions (can include question bank IDs or full questions)
      mcqQuestions: templateData.mcqQuestions || [],
      codingQuestions: templateData.codingQuestions || [],
      questionBankIds: templateData.questionBankIds || [], // Reference to question bank
      
      // Settings
      passingMarks: templateData.passingMarks || null,
      randomizeQuestions: templateData.randomizeQuestions || false,
      showResultsImmediately: templateData.showResultsImmediately || false,
      allowReview: templateData.allowReview || false,
      
      // Instructions
      instructions: templateData.instructions || '',
      
      // Ownership
      createdBy: templateData.createdBy,
      isPublic: templateData.isPublic || false,
      
      // Usage tracking
      timesUsed: 0,
      
      // Tags
      tags: templateData.tags || [],
      category: templateData.category || 'general',
      
      // Status
      isActive: true,
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await templateRef.set(template);
    return { ...template, id: templateRef.id };
  }

  static async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async find(query = {}, options = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    
    if (query.createdBy) {
      queryRef = queryRef.where('createdBy', '==', query.createdBy);
    }
    
    if (query.type) {
      queryRef = queryRef.where('type', '==', query.type);
    }
    
    if (query.isPublic !== undefined) {
      queryRef = queryRef.where('isPublic', '==', query.isPublic);
    }
    
    if (query.isActive !== undefined) {
      queryRef = queryRef.where('isActive', '==', query.isActive);
    }
    
    if (query.category) {
      queryRef = queryRef.where('category', '==', query.category);
    }
    
    if (options.limit) {
      queryRef = queryRef.limit(options.limit);
    }
    
    queryRef = queryRef.orderBy('createdAt', 'desc');
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async findAccessible(facultyId, filters = {}) {
    const ownTemplates = await this.find({ 
      createdBy: facultyId,
      isActive: true,
      ...filters 
    });
    
    const publicTemplates = await this.find({ 
      isPublic: true,
      isActive: true,
      ...filters 
    }).then(templates => 
      templates.filter(t => t.createdBy !== facultyId)
    );
    
    return [...ownTemplates, ...publicTemplates].sort((a, b) => {
      const dateA = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const dateB = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }

  static async updateById(id, updates) {
    const db = getFirestore();
    const templateRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.timesUsed;
    
    await templateRef.update(updateData);
    
    const doc = await templateRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    return await this.updateById(id, { isActive: false });
  }

  static async incrementUsage(templateId) {
    const template = await this.findById(templateId);
    
    if (template) {
      const db = getFirestore();
      const templateRef = db.collection(COLLECTION_NAME).doc(templateId);
      await templateRef.update({
        timesUsed: (template.timesUsed || 0) + 1
      });
    }
  }

  /**
   * Create exam from template
   */
  static async createExamFromTemplate(templateId, examData) {
    const template = await this.findById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    const { Exam } = await import('./Exam.js');
    
    // Merge template data with provided exam data
    const newExam = await Exam.create({
      title: examData.title || template.name,
      type: template.type,
      subjectId: template.subjectId,
      createdBy: examData.createdBy,
      durationMinutes: examData.durationMinutes || template.durationMinutes,
      totalMarks: examData.totalMarks || template.totalMarks,
      startsAt: examData.startsAt || null,
      endsAt: examData.endsAt || null,
      isPublished: examData.isPublished || false,
      mcqQuestions: template.mcqQuestions || [],
      codingQuestions: template.codingQuestions || [],
      instructions: template.instructions || '',
      passingMarks: template.passingMarks,
      randomizeQuestions: template.randomizeQuestions,
      showResultsImmediately: template.showResultsImmediately,
      allowReview: template.allowReview
    });
    
    // Increment usage
    await this.incrementUsage(templateId);
    
    return newExam;
  }
}
