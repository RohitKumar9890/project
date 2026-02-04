import { Router } from 'express';
import { body } from 'express-validator';
import { exportUserData, requestAccountDeletion, getPrivacyDashboard, cancelAccountDeletion } from '../controllers/privacyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get privacy dashboard
router.get('/dashboard', asyncHandler(getPrivacyDashboard));

// Export user data
router.get('/export', asyncHandler(exportUserData));

// Request account deletion
router.post(
  '/delete-account',
  [
    body('password').notEmpty().withMessage('Password is required'),
    body('confirmation').equals('DELETE MY ACCOUNT').withMessage('Invalid confirmation')
  ],
  asyncHandler(requestAccountDeletion)
);

// Cancel account deletion
router.post('/cancel-deletion', asyncHandler(cancelAccountDeletion));

export default router;
