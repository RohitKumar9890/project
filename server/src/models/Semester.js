import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'semesters';

export class Semester {
  static async create(semesterData) {
    const db = getFirestore();
    const semesterRef = db.collection(COLLECTION_NAME).doc();
    
    const semester = {
      _id: semesterRef.id,
      name: semesterData.name,
      year: semesterData.year,
      term: semesterData.term,
      startDate: semesterData.startDate,
      endDate: semesterData.endDate,
      isActive: semesterData.isActive !== undefined ? semesterData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await semesterRef.set(semester);
    return { ...semester, id: semesterRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const semestersRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await semestersRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    let queryRef = semestersRef;
    
    if (query.year) {
      queryRef = queryRef.where('year', '==', query.year);
    }
    if (query.term) {
      queryRef = queryRef.where('term', '==', query.term);
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
    
    if (query.year) {
      queryRef = queryRef.where('year', '==', query.year);
    }
    if (query.isActive !== undefined) {
      queryRef = queryRef.where('isActive', '==', query.isActive);
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
    const semesterRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await semesterRef.update(updateData);
    
    const doc = await semesterRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }
}
