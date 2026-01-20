import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'announcements';

export class Announcement {
  static async create(announcementData) {
    const db = getFirestore();
    const announcementRef = db.collection(COLLECTION_NAME).doc();
    
    const announcement = {
      _id: announcementRef.id,
      title: announcementData.title,
      content: announcementData.content,
      subjectId: announcementData.subjectId,
      createdBy: announcementData.createdBy,
      priority: announcementData.priority || 'normal',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await announcementRef.set(announcement);
    return { ...announcement, id: announcementRef.id };
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
    
    queryRef = queryRef.orderBy('createdAt', 'desc');
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async updateById(id, updates) {
    const db = getFirestore();
    const announcementRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await announcementRef.update(updateData);
    
    const doc = await announcementRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }
}
