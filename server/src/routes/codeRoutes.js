import { Router } from 'express';
import { body } from 'express-validator';
import { execute } from '../controllers/codeController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { codeExecutionLimiter, dailyQuotaMiddleware } from '../middleware/codeExecutionLimiter.js';

const router = Router();

// Allow both faculty and students to run code
router.post(
  '/execute',
  requireAuth,
  requireRole('faculty', 'student'),
  codeExecutionLimiter, // Per-minute rate limiting
  dailyQuotaMiddleware, // Daily quota check
  [
    body('language').isIn(['javascript', 'python']),
    body('code').isString().isLength({ min: 1, max: 50000 }), // Increased from 20k to 50k but with security checks
    body('stdin').optional().isString().isLength({ max: 10000 }), // Reduced from 20k to 10k
  ],
  execute
);

export default router;
