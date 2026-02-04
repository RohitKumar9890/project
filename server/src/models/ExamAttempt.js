import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'examAttempts';

/**
 * Track detailed exam attempt information for security monitoring
 */
export class ExamAttempt {
  static async create(attemptData) {
    const db = getFirestore();
    const attemptRef = db.collection(COLLECTION_NAME).doc();
    
    const attempt = {
      _id: attemptRef.id,
      examId: attemptData.examId,
      studentId: attemptData.studentId,
      submissionId: attemptData.submissionId || null,
      startedAt: Timestamp.now(),
      lastActivityAt: Timestamp.now(),
      ipAddress: attemptData.ipAddress || null,
      userAgent: attemptData.userAgent || null,
      tabSwitches: 0,
      copyPasteEvents: 0,
      rightClickEvents: 0,
      fullScreenExits: 0,
      suspiciousActivities: [],
      isActive: true,
      completedAt: null
    };
    
    await attemptRef.set(attempt);
    return { ...attempt, id: attemptRef.id };
  }

  static async findOne(query) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query._id) {
      const doc = await queryRef.doc(query._id).get();
      if (!doc.exists) return null;
      return { id: doc.id, _id: doc.id, ...doc.data() };
    }
    
    if (query.examId) {
      queryRef = queryRef.where('examId', '==', query.examId);
    }
    if (query.studentId) {
      queryRef = queryRef.where('studentId', '==', query.studentId);
    }
    if (query.isActive !== undefined) {
      queryRef = queryRef.where('isActive', '==', query.isActive);
    }
    
    const snapshot = await queryRef.limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
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
    const attemptRef = db.collection(COLLECTION_NAME).doc(id);
    
    const updateData = {
      ...updates,
      lastActivityAt: Timestamp.now()
    };
    
    await attemptRef.update(updateData);
    
    const doc = await attemptRef.get();
    return { id: doc.id, _id: doc.id, ...doc.data() };
  }

  static async recordActivity(attemptId, activityType, details = {}) {
    const attempt = await this.findOne({ _id: attemptId });
    if (!attempt) return null;
    
    const updates = {
      lastActivityAt: Timestamp.now()
    };
    
    // Increment activity counters
    switch (activityType) {
      case 'TAB_SWITCH':
        updates.tabSwitches = (attempt.tabSwitches || 0) + 1;
        break;
      case 'COPY_PASTE':
        updates.copyPasteEvents = (attempt.copyPasteEvents || 0) + 1;
        break;
      case 'RIGHT_CLICK':
        updates.rightClickEvents = (attempt.rightClickEvents || 0) + 1;
        break;
      case 'FULLSCREEN_EXIT':
        updates.fullScreenExits = (attempt.fullScreenExits || 0) + 1;
        break;
      case 'SUSPICIOUS':
        updates.suspiciousActivities = [
          ...(attempt.suspiciousActivities || []),
          {
            type: details.type || 'UNKNOWN',
            timestamp: new Date().toISOString(),
            details: details.details || {}
          }
        ];
        break;
    }
    
    return await this.updateById(attemptId, updates);
  }
}
