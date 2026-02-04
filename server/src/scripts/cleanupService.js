/**
 * Background service for periodic cleanup tasks
 * Run this with node-cron or as a separate service
 */

import { RefreshToken } from '../models/RefreshToken.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import cron from 'node-cron';

/**
 * Delete expired refresh tokens
 */
export const cleanupExpiredTokens = async () => {
  try {
    console.log('[Cleanup] Starting expired token cleanup...');
    const deleted = await RefreshToken.deleteExpiredTokens();
    console.log(`[Cleanup] Deleted ${deleted} expired tokens`);
  } catch (error) {
    console.error('[Cleanup] Error deleting expired tokens:', error);
  }
};

/**
 * Delete old audit logs (keep 1 year)
 */
export const cleanupOldAuditLogs = async () => {
  try {
    console.log('[Cleanup] Starting old audit logs cleanup...');
    const deleted = await AuditLog.deleteOldLogs(365); // Keep 1 year
    console.log(`[Cleanup] Deleted ${deleted} old audit logs`);
  } catch (error) {
    console.error('[Cleanup] Error deleting old audit logs:', error);
  }
};

/**
 * Permanently delete accounts scheduled for deletion
 */
export const deleteScheduledAccounts = async () => {
  try {
    console.log('[Cleanup] Starting scheduled account deletion...');
    
    const users = await User.find({});
    const now = new Date();
    let deletedCount = 0;
    
    for (const user of users) {
      if (user.scheduledDeletion) {
        const deletionDate = user.scheduledDeletion?.toDate?.() || new Date(user.scheduledDeletion);
        
        if (deletionDate <= now) {
          // Permanently delete user and all associated data
          // This is a hard delete - be very careful!
          await User.deleteById(user._id || user.id);
          
          // Delete associated data
          const { Submission } = await import('../models/Submission.js');
          const { Progress } = await import('../models/Progress.js');
          
          const submissions = await Submission.find({ studentId: user._id || user.id });
          for (const submission of submissions) {
            await Submission.deleteById(submission._id || submission.id);
          }
          
          const progressRecords = await Progress.find({ studentId: user._id || user.id });
          for (const progress of progressRecords) {
            await Progress.deleteById(progress._id || progress.id);
          }
          
          // Revoke all tokens
          await RefreshToken.revokeAllUserTokens(user._id || user.id);
          
          deletedCount++;
          console.log(`[Cleanup] Permanently deleted user ${user.email}`);
        }
      }
    }
    
    console.log(`[Cleanup] Deleted ${deletedCount} scheduled accounts`);
  } catch (error) {
    console.error('[Cleanup] Error deleting scheduled accounts:', error);
  }
};

/**
 * Run all cleanup tasks
 */
export const runCleanupTasks = async () => {
  console.log('[Cleanup] Starting cleanup tasks...');
  await cleanupExpiredTokens();
  await cleanupOldAuditLogs();
  await deleteScheduledAccounts();
  console.log('[Cleanup] All cleanup tasks completed');
};

/**
 * Schedule cleanup tasks with cron
 */
export const scheduleCleanupTasks = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running scheduled cleanup tasks...');
    await runCleanupTasks();
  });
  
  console.log('[Cron] Cleanup tasks scheduled (daily at 2 AM)');
};

// Run cleanup on startup if needed
if (process.env.RUN_CLEANUP_ON_STARTUP === 'true') {
  runCleanupTasks().catch(console.error);
}
