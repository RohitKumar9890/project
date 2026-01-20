import { getFirestore, Timestamp } from '../config/firebase.js';

export const EXAM_TYPES = /** @type {const} */ ({
  MCQ: 'mcq',
  QUIZ: 'quiz',
  CODING: 'coding',
});

const COLLECTION_NAME = 'exams';

export class Exam {
  static generateExamCode() {
    // Generate a unique 6-character exam code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static async create(examData) {
    const db = getFirestore();
    const examRef = db.collection(COLLECTION_NAME).doc();
    
    // Generate unique exam code
    let examCode = this.generateExamCode();
    let existing = await this.findOne({ examCode });
    
    // Ensure uniqueness
    while (existing) {
      examCode = this.generateExamCode();
      existing = await this.findOne({ examCode });
    }
    
    const exam = {
      _id: examRef.id,
      title: examData.title,
      type: examData.type,
      subjectId: examData.subjectId,
      createdBy: examData.createdBy,
      durationMinutes: examData.durationMinutes,
      totalMarks: examData.totalMarks,
      startsAt: examData.startsAt || null,
      endsAt: examData.endsAt || null,
      isPublished: examData.isPublished !== undefined ? examData.isPublished : false,
      examCode: examCode, // Add unique exam code
      enrolledStudents: [], // Track which students joined
      mcqQuestions: examData.mcqQuestions || [],
      codingQuestions: examData.codingQuestions || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await examRef.set(exam);
    return { ...exam, id: examRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const examsRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await examsRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    let queryRef = examsRef;
    
    if (query.examCode) {
      queryRef = queryRef.where('examCode', '==', query.examCode.toUpperCase());
    }
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    if (query.type) {
      queryRef = queryRef.where('type', '==', query.type);
    }
    
    const snapshot = await queryRef.limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async find(query = {}) {
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
    if (query.isPublished !== undefined) {
      queryRef = queryRef.where('isPublished', '==', query.isPublished);
    }
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async updateById(id, updates) {
    const db = getFirestore();
    const examRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await examRef.update(updateData);
    
    const doc = await examRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }

  static async populate(exam, field) {
    if (!exam) return exam;
    
    if (field === 'subjectId' && exam.subjectId) {
      const { Subject } = await import('./Subject.js');
      exam.subject = await Subject.findById(exam.subjectId);
    }
    
    if (field === 'createdBy' && exam.createdBy) {
      const { User } = await import('./User.js');
      exam.creator = await User.findById(exam.createdBy);
    }
    
    return exam;
  }
}
