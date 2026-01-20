import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'sections';

export class Section {
  static async create(sectionData) {
    const db = getFirestore();
    const sectionRef = db.collection(COLLECTION_NAME).doc();
    
    const section = {
      _id: sectionRef.id,
      name: sectionData.name, // e.g., "Section A", "Section B"
      subjectId: sectionData.subjectId,
      facultyId: sectionData.facultyId,
      semesterId: sectionData.semesterId,
      maxStudents: sectionData.maxStudents || 75,
      enrolledStudents: [], // Array of student IDs
      schedule: sectionData.schedule || {}, // { day: "Monday", time: "10:00 AM" }
      isActive: sectionData.isActive !== undefined ? sectionData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await sectionRef.set(section);
    return { ...section, id: sectionRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const sectionsRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await sectionsRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    let queryRef = sectionsRef;
    
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    if (query.facultyId) {
      queryRef = queryRef.where('facultyId', '==', query.facultyId);
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
    
    if (query.subjectId) {
      queryRef = queryRef.where('subjectId', '==', query.subjectId);
    }
    if (query.facultyId) {
      queryRef = queryRef.where('facultyId', '==', query.facultyId);
    }
    if (query.semesterId) {
      queryRef = queryRef.where('semesterId', '==', query.semesterId);
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
    const sectionRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await sectionRef.update(updateData);
    
    const doc = await sectionRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }

  static async enrollStudent(sectionId, studentId) {
    const section = await this.findById(sectionId);
    if (!section) throw new Error('Section not found');
    
    const enrolledStudents = section.enrolledStudents || [];
    
    // Check if student already enrolled
    if (enrolledStudents.includes(studentId)) {
      throw new Error('Student already enrolled in this section');
    }
    
    // Check max capacity
    if (enrolledStudents.length >= section.maxStudents) {
      throw new Error('Section is full');
    }
    
    enrolledStudents.push(studentId);
    return await this.updateById(sectionId, { enrolledStudents });
  }

  static async unenrollStudent(sectionId, studentId) {
    const section = await this.findById(sectionId);
    if (!section) throw new Error('Section not found');
    
    const enrolledStudents = (section.enrolledStudents || []).filter(id => id !== studentId);
    return await this.updateById(sectionId, { enrolledStudents });
  }
}
