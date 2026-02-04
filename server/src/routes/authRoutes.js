import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, me, logout, logoutAll, requestPasswordReset, resetPassword, oauthLogin, setupMFA, verifyAndEnableMFA, disableMFA } from '../controllers/authController.js';
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
    body('password').isString().isLength({ min: 8 }),
    body('role').optional().isIn(['faculty', 'student']), // Make role optional, defaults to student
  ],
  asyncHandler(register)
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail(), 
    body('password').isString().isLength({ min: 1 }),
    body('mfaToken').optional().isString().isLength({ min: 6, max: 6 })
  ],
  asyncHandler(login)
);

router.post('/refresh', [body('refreshToken').isString().isLength({ min: 10 })], asyncHandler(refresh));

router.get('/me', requireAuth, asyncHandler(me));

router.post('/logout', requireAuth, asyncHandler(logout));

router.post('/logout-all', requireAuth, asyncHandler(logoutAll));

// Password reset routes
router.post(
  '/request-password-reset',
  authLimiter,
  [body('email').isEmail()],
  asyncHandler(requestPasswordReset)
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').isString().isLength({ min: 10 }),
    body('newPassword').isString().isLength({ min: 8 }),
  ],
  asyncHandler(resetPassword)
);

// OAuth login route (Google/Microsoft)
router.post(
  '/oauth/login',
  authLimiter,
  [
    body('idToken').isString().isLength({ min: 10 }),
    body('provider').optional().isString().isIn(['google.com', 'microsoft.com', 'google', 'microsoft']),
  ],
  asyncHandler(oauthLogin)
);

// MFA routes
router.post('/mfa/setup', requireAuth, asyncHandler(setupMFA));

router.post(
  '/mfa/verify',
  requireAuth,
  [body('token').isString().isLength({ min: 6, max: 6 })],
  asyncHandler(verifyAndEnableMFA)
);

router.post(
  '/mfa/disable',
  requireAuth,
  [
    body('password').isString().isLength({ min: 1 }),
    body('token').isString().isLength({ min: 6, max: 6 })
  ],
  asyncHandler(disableMFA)
);

export default router;
