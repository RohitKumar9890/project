import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'progress';

export class Progress {
  static async create(progressData) {
    const db = getFirestore();
    const progressRef = db.collection(COLLECTION_NAME).doc();
    
    const progress = {
      _id: progressRef.id,
      studentId: progressData.studentId,
      subjectId: progressData.subjectId,
      completedMaterials: progressData.completedMaterials || [],
      examScores: progressData.examScores || [],
      overallProgress: progressData.overallProgress || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await progressRef.set(progress);
    return { ...progress, id: progressRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const progressRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await progressRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    let queryRef = progressRef;
    
    if (query.studentId) {
      queryRef = queryRef.where('studentId', '==', query.studentId);
    }
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    
    const snapshot = await queryRef.limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async find(query = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query.studentId) {
      queryRef = queryRef.where('studentId', '==', query.studentId);
    }
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
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
    const progressRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await progressRef.update(updateData);
    
    const doc = await progressRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }
}
