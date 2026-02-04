import { getFirestore, Timestamp } from '../config/firebase.js';

const COLLECTION_NAME = 'auditLogs';

export const AUDIT_ACTIONS = {
  // Auth actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  
  // User actions
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  
  // Exam actions
  EXAM_CREATED: 'exam_created',
  EXAM_UPDATED: 'exam_updated',
  EXAM_DELETED: 'exam_deleted',
  EXAM_PUBLISHED: 'exam_published',
  EXAM_STARTED: 'exam_started',
  EXAM_SUBMITTED: 'exam_submitted',
  
  // Data actions
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  
  // Security actions
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  FAILED_LOGIN: 'failed_login',
  ACCOUNT_LOCKED: 'account_locked',
};

export class AuditLog {
  static async create(logData) {
    const db = getFirestore();
    const logRef = db.collection(COLLECTION_NAME).doc();
    
    const log = {
      _id: logRef.id,
      userId: logData.userId || null,
      action: logData.action,
      resourceType: logData.resourceType || null,
      resourceId: logData.resourceId || null,
      details: logData.details || {},
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      timestamp: Timestamp.now(),
      success: logData.success !== undefined ? logData.success : true
    };
    
    await logRef.set(log);
    return { ...log, id: logRef.id };
  }

  static async find(query = {}, options = {}) {
    const db = getFirestore();
    let queryRef = db.collection(COLLECTION_NAME);
    
    if (query.userId) {
      queryRef = queryRef.where('userId', '==', query.userId);
    }
    if (query.action) {
      queryRef = queryRef.where('action', '==', query.action);
    }
    if (query.resourceType) {
      queryRef = queryRef.where('resourceType', '==', query.resourceType);
    }
    if (query.resourceId) {
      queryRef = queryRef.where('resourceId', '==', query.resourceId);
    }
    
    // Sort by timestamp descending
    queryRef = queryRef.orderBy('timestamp', 'desc');
    
    // Apply limit
    if (options.limit) {
      queryRef = queryRef.limit(options.limit);
    }
    
    const snapshot = await queryRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data()
    }));
  }

  static async deleteOldLogs(daysToKeep = 365) {
    const db = getFirestore();
    const cutoffDate = Timestamp.fromDate(
      new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    );
    
    const oldLogs = await db.collection(COLLECTION_NAME)
      .where('timestamp', '<', cutoffDate)
      .get();
    
    const batch = db.batch();
    oldLogs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return oldLogs.size;
  }
}
