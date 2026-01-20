import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'submissions';

export class Submission {
  static async create(submissionData) {
    const db = getFirestore();
    const submissionRef = db.collection(COLLECTION_NAME).doc();
    
    const submission = {
      _id: submissionRef.id,
      examId: submissionData.examId,
      studentId: submissionData.studentId,
      answers: submissionData.answers || [],
      score: submissionData.score || 0,
      maxScore: submissionData.maxScore || 0,
      startedAt: submissionData.startedAt || Timestamp.now(),
      submittedAt: submissionData.submittedAt || null,
      status: submissionData.status || 'in_progress', // in_progress, submitted, graded
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await submissionRef.set(submission);
    return { ...submission, id: submissionRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const submissionsRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await submissionsRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    let queryRef = submissionsRef;
    
    if (query.examId) {
      queryRef = queryRef.where('examId', '==', query.examId);
    }
    if (query.studentId) {
      queryRef = queryRef.where('studentId', '==', query.studentId);
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
    
    if (query.examId) {
      queryRef = queryRef.where('examId', '==', query.examId);
    }
    if (query.studentId) {
      queryRef = queryRef.where('studentId', '==', query.studentId);
    }
    if (query.status) {
      queryRef = queryRef.where('status', '==', query.status);
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
    const submissionRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await submissionRef.update(updateData);
    
    const doc = await submissionRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }
}
