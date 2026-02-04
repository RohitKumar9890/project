import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLog,
  getAuditLogStats,
  getAuditActions,
  exportAuditLogs
} from '../../controllers/admin/auditLogController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Get available actions
router.get('/actions', asyncHandler(getAuditActions));

// Get statistics
router.get('/stats', asyncHandler(getAuditLogStats));

// Export logs
router.get('/export', asyncHandler(exportAuditLogs));

// Get all logs (with filters)
router.get('/', asyncHandler(getAuditLogs));

// Get single log
router.get('/:id', asyncHandler(getAuditLog));

export default router;
