import { Router } from 'express';
import { body } from 'express-validator';
import { execute } from '../controllers/codeController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Allow both faculty and students to run code
router.post(
  '/execute',
  requireAuth,
  requireRole('faculty', 'student'),
  [
    body('language').isIn(['javascript', 'python']),
    body('code').isString().isLength({ min: 1, max: 20000 }),
    body('stdin').optional().isString().isLength({ max: 20000 }),
  ],
  execute
);

export default router;
