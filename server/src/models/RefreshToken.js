import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'refreshTokens';

export class RefreshToken {
  static async create(tokenData) {
    const db = getFirestore();
    const tokenRef = db.collection(COLLECTION_NAME).doc();
    
    const token = {
      _id: tokenRef.id,
      userId: tokenData.userId,
      token: tokenData.token,
      deviceInfo: tokenData.deviceInfo || null,
      ipAddress: tokenData.ipAddress || null,
      expiresAt: tokenData.expiresAt || Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      createdAt: Timestamp.now(),
      isRevoked: false
    };
    
    await tokenRef.set(token);
    return { ...token, id: tokenRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await queryRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    if (query.token) {
      queryRef = queryRef.where('token', '==', query.token);
    }
    if (query.userId) {
      queryRef = queryRef.where('userId', '==', query.userId);
    }
    if (query.isRevoked !== undefined) {
      queryRef = queryRef.where('isRevoked', '==', query.isRevoked);
    }
    
    const snapshot = await queryRef.limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async find(query = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query.userId) {
      queryRef = queryRef.where('userId', '==', query.userId);
    }
    if (query.isRevoked !== undefined) {
      queryRef = queryRef.where('isRevoked', '==', query.isRevoked);
    }
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async revokeToken(tokenId) {
    const db = getFirestore();
    await db.collection(COLLECTION_NAME).doc(tokenId).update({
      isRevoked: true,
      revokedAt: Timestamp.now()
    });
  }

  static async revokeAllUserTokens(userId) {
    const tokens = await this.find({ userId, isRevoked: false });
    const db = getFirestore();
    const batch = db.batch();
    
    tokens.forEach(token => {
      const tokenRef = db.collection(COLLECTION_NAME).doc(token._id || token.id);
      batch.update(tokenRef, {
        isRevoked: true,
        revokedAt: Timestamp.now()
      });
    });
    
    await batch.commit();
  }

  static async deleteExpiredTokens() {
    const db = getFirestore();
    const now = Timestamp.now();
    
    const expiredTokens = await db.collection(COLLECTION_NAME)
      .where('expiresAt', '<', now)
      .get();
    
    const batch = db.batch();
    expiredTokens.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return expiredTokens.size;
  }
}
