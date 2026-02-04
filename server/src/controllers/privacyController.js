import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { Submission } from '../models/Submission.js';
import { Progress } from '../models/Progress.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/AuditLog.js';
import { RefreshToken } from '../models/RefreshToken.js';

/**
 * Export all user data (GDPR Right to Data Portability)
 */
export const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user data
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get all related data
  const [submissions, progress, auditLogs, refreshTokens] = await Promise.all([
    Submission.find({ studentId: userId }),
    Progress.find({ studentId: userId }),
    AuditLog.find({ userId }, { limit: 1000 }), // Last 1000 logs
    RefreshToken.find({ userId })
  ]);
  
  // Get exams created by faculty
  let createdExams = [];
  if (user.role === 'faculty') {
    createdExams = await Exam.find({ createdBy: userId });
  }
  
  // Prepare export data
  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    submissions: submissions.map(s => ({
      id: s._id || s.id,
      examId: s.examId,
      score: s.score,
      maxScore: s.maxScore,
      status: s.status,
      submittedAt: s.submittedAt,
      answers: s.answers
    })),
    progress: progress.map(p => ({
      id: p._id || p.id,
      subjectId: p.subjectId,
      totalMarks: p.totalMarks,
      obtainedMarks: p.obtainedMarks,
      examsTaken: p.examsTaken
    })),
    createdExams: createdExams.map(e => ({
      id: e._id || e.id,
      title: e.title,
      type: e.type,
      totalMarks: e.totalMarks,
      createdAt: e.createdAt
    })),
    auditLogs: auditLogs.map(log => ({
      action: log.action,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      success: log.success
    })),
    activeSessions: refreshTokens.filter(t => !t.isRevoked).length
  };
  
  // Log data export
  await AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.DATA_EXPORTED,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Send as JSON file download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
  res.json(exportData);
});

/**
 * Request account deletion (GDPR Right to be Forgotten)
 */
export const requestAccountDeletion = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password, confirmation } = req.body;
  
  if (confirmation !== 'DELETE MY ACCOUNT') {
    return res.status(400).json({ 
      message: 'Please type "DELETE MY ACCOUNT" to confirm deletion' 
    });
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Verify password
  const { verifyPassword } = await import('../utils/password.js');
  if (user.passwordHash) {
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
  }
  
  // Mark account for deletion (soft delete)
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30); // 30 days grace period
  
  await User.updateById(userId, {
    isActive: false,
    scheduledDeletion: deletionDate,
    deletionRequested: new Date()
  });
  
  // Revoke all sessions
  await RefreshToken.revokeAllUserTokens(userId);
  
  // Log deletion request
  await AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.USER_DELETED,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { type: 'soft_delete', scheduledFor: deletionDate }
  });
  
  res.json({
    message: 'Account deletion scheduled',
    deletionDate,
    note: 'Your account will be permanently deleted in 30 days. Contact support to cancel this request.'
  });
});

/**
 * Get privacy settings and data summary
 */
export const getPrivacyDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get data counts
  const [submissionsCount, auditLogsCount, activeSessionsCount] = await Promise.all([
    Submission.find({ studentId: userId }).then(s => s.length),
    AuditLog.find({ userId }, { limit: 1 }).then(logs => logs.length > 0 ? 1000 : 0), // Estimate
    RefreshToken.find({ userId, isRevoked: false }).then(t => t.length)
  ]);
  
  res.json({
    accountInfo: {
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      mfaEnabled: user.mfaEnabled || false
    },
    dataCollected: {
      submissions: submissionsCount,
      auditLogs: auditLogsCount,
      activeSessions: activeSessionsCount
    },
    rights: {
      dataExport: {
        available: true,
        description: 'Download all your personal data'
      },
      accountDeletion: {
        available: true,
        description: 'Permanently delete your account and all associated data'
      }
    },
    scheduledDeletion: user.scheduledDeletion || null
  });
});

/**
 * Cancel scheduled account deletion
 */
export const cancelAccountDeletion = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId);
  if (!user || !user.scheduledDeletion) {
    return res.status(400).json({ message: 'No deletion scheduled' });
  }
  
  await User.updateById(userId, {
    isActive: true,
    scheduledDeletion: null,
    deletionRequested: null
  });
  
  await AuditLog.create({
    userId,
    action: 'account_deletion_cancelled',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ message: 'Account deletion cancelled successfully' });
});
