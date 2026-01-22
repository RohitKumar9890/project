import { getFirestore, Timestamp } from '../config/firebase.js';

export const USER_ROLES = /** @type {const} */ ({
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
});

const COLLECTION_NAME = 'users';

export class User {
  static async create(userData) {
    const db = getFirestore();
    const userRef = db.collection(COLLECTION_NAME).doc();
    
    const user = {
      _id: userRef.id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash || null,
      role: userData.role,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      // OAuth fields
      firebaseUid: userData.firebaseUid || null,
      oauthProvider: userData.oauthProvider || null,
      photoURL: userData.photoURL || null,
      // Password reset fields
      resetPasswordToken: userData.resetPasswordToken || null,
      resetPasswordExpires: userData.resetPasswordExpires || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await userRef.set(user);
    return { ...user, id: userRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    const usersRef = db.collection(COLLECTION_NAME);
    
    let queryRef = usersRef;
    
    if (query.email) {
      queryRef = queryRef.where('email', '==', query.email.toLowerCase());
    }
    if (query._id) {
      const doc = await usersRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
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
    
    if (query.role) {
      queryRef = queryRef.where('role', '==', query.role);
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
    const userRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await userRef.update(updateData);
    
    const doc = await userRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async deleteById(id) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { id, _id: id };
  }
}
