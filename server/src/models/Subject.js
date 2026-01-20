import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'subjects';

export class Subject {
  static async create(subjectData) {
    const db = getFirestore();
    const subjectRef = db.collection(COLLECTION_NAME).doc();
    
    const subject = {
      _id: subjectRef.id,
      name: subjectData.name,
      code: subjectData.code,
      semesterId: subjectData.semesterId,
      facultyId: subjectData.facultyId,
      syllabus: subjectData.syllabus || { units: [] },
      isActive: subjectData.isActive !== undefined ? subjectData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await subjectRef.set(subject);
    return { ...subject, id: subjectRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const subjectsRef = db.collection(COLLECTION_NAME);
    
    let queryRef = subjectsRef;
    
    if (query._id) {
      const doc = await subjectsRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    if (query.code) {
      queryRef = queryRef.where('code', '==', query.code);
    }
    if (query.semesterId) {
      queryRef = queryRef.where('semesterId', '==', query.semesterId);
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
    
    if (query.semesterId) {
      queryRef = queryRef.where('semesterId', '==', query.semesterId);
    }
    if (query.facultyId) {
      queryRef = queryRef.where('facultyId', '==', query.facultyId);
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
    const subjectRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await subjectRef.update(updateData);
    
    const doc = await subjectRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }

  static async populate(subject, field) {
    if (!subject) return subject;
    
    if (field === 'semesterId' && subject.semesterId) {
      const { Semester } = await import('./Semester.js');
      subject.semester = await Semester.findById(subject.semesterId);
    }
    
    if (field === 'facultyId' && subject.facultyId) {
      const { User } = await import('./User.js');
      subject.faculty = await User.findById(subject.facultyId);
    }
    
    return subject;
  }
}
