import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuditLog, AUDIT_ACTIONS } from '../../models/AuditLog.js';
import { User } from '../../models/User.js';

/**
 * Get audit logs with filters and pagination
 * @route GET /api/admin/audit-logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    userId,
    action,
    resourceType,
    success,
    startDate,
    endDate,
    limit = 100,
    page = 1
  } = req.query;
  
  // Build query
  const query = {};
  
  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (success !== undefined) query.success = success === 'true';
  
  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }
  
  // Get logs with pagination
  const limitNum = parseInt(limit) || 100;
  const skip = (parseInt(page) - 1) * limitNum;
  
  const logs = await AuditLog.find(query, { limit: limitNum });
  
  // Apply skip manually (Firestore doesn't support skip directly)
  const paginatedLogs = logs.slice(skip, skip + limitNum);
  
  // Populate user info
  const logsWithUsers = await Promise.all(
    paginatedLogs.map(async (log) => {
      if (log.userId) {
        const user = await User.findById(log.userId);
        return {
          ...log,
          user: user ? {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null
        };
      }
      return log;
    })
  );
  
  res.json({
    logs: logsWithUsers,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total: logs.length,
      hasMore: logs.length > skip + limitNum
    }
  });
});

/**
 * Get audit log by ID
 * @route GET /api/admin/audit-logs/:id
 */
export const getAuditLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id);
  
  if (!log) {
    return res.status(404).json({ message: 'Audit log not found' });
  }
  
  // Populate user info
  if (log.userId) {
    const user = await User.findById(log.userId);
    if (user) {
      log.user = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }
  }
  
  res.json({ log });
});

/**
 * Get audit log statistics
 * @route GET /api/admin/audit-logs/stats
 */
export const getAuditLogStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Build query for date range
  const query = {};
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  // Get all logs in range
  const logs = await AuditLog.find(query);
  
  // Calculate statistics
  const totalLogs = logs.length;
  const successfulActions = logs.filter(log => log.success !== false).length;
  const failedActions = totalLogs - successfulActions;
  
  // Count by action type
  const actionCounts = {};
  logs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });
  
  // Top actions
  const topActions = Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));
  
  // Count by user
  const userCounts = {};
  logs.forEach(log => {
    if (log.userId) {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    }
  });
  
  // Top users
  const topUserIds = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  const topUsers = await Promise.all(
    topUserIds.map(async ([userId, count]) => {
      const user = await User.findById(userId);
      return {
        userId,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        activityCount: count
      };
    })
  );
  
  // Activity by resource type
  const resourceTypeCounts = {};
  logs.forEach(log => {
    if (log.resourceType) {
      resourceTypeCounts[log.resourceType] = (resourceTypeCounts[log.resourceType] || 0) + 1;
    }
  });
  
  // Security events
  const securityEvents = logs.filter(log => 
    ['failed_login', 'account_locked', 'suspicious_activity', 'mfa_enabled', 'mfa_disabled']
      .includes(log.action)
  ).length;
  
  res.json({
    overview: {
      totalLogs,
      successfulActions,
      failedActions,
      securityEvents
    },
    topActions,
    topUsers,
    resourceTypeCounts
  });
});

/**
 * Get available audit action types
 * @route GET /api/admin/audit-logs/actions
 */
export const getAuditActions = asyncHandler(async (req, res) => {
  res.json({
    actions: Object.values(AUDIT_ACTIONS)
  });
});

/**
 * Export audit logs (for compliance)
 * @route GET /api/admin/audit-logs/export
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  // Build query
  const query = {};
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  // Get logs
  const logs = await AuditLog.find(query);
  
  // Populate user info
  const logsWithUsers = await Promise.all(
    logs.map(async (log) => {
      if (log.userId) {
        const user = await User.findById(log.userId);
        return {
          ...log,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          userRole: user?.role || 'Unknown'
        };
      }
      return {
        ...log,
        userName: 'Anonymous',
        userEmail: 'N/A',
        userRole: 'N/A'
      };
    })
  );
  
  if (format === 'csv') {
    // Generate CSV
    const csvHeader = 'Timestamp,Action,User Name,User Email,Role,Resource Type,Resource ID,IP Address,Success,Details\n';
    const csvRows = logsWithUsers.map(log => {
      const timestamp = log.timestamp?.toDate?.() || new Date(log.timestamp);
      return [
        timestamp.toISOString(),
        log.action,
        log.userName,
        log.userEmail,
        log.userRole,
        log.resourceType || 'N/A',
        log.resourceId || 'N/A',
        log.ipAddress || 'N/A',
        log.success !== false ? 'Yes' : 'No',
        JSON.stringify(log.details || {}).replace(/"/g, '""')
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  } else {
    // JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      totalRecords: logsWithUsers.length,
      logs: logsWithUsers
    });
  }
});
