import { Router } from 'express';
import {
  googleAuth,
  googleCallback,
  microsoftAuth,
  microsoftCallback,
} from '../controllers/oauthController.js';

const router = Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Microsoft OAuth routes
router.get('/microsoft', microsoftAuth);
router.get('/microsoft/callback', microsoftCallback);

export default router;
