import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('role').optional().isIn(['faculty', 'student']), // Make role optional, defaults to student
  ],
  asyncHandler(register)
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail(), body('password').isString().isLength({ min: 1 })],
  asyncHandler(login)
);

router.post('/refresh', [body('refreshToken').isString().isLength({ min: 10 })], asyncHandler(refresh));

router.get('/me', requireAuth, asyncHandler(me));

export default router;
