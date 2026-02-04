import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listPublishedExams,
  getPublishedExam,
  startAttempt,
  submitAttempt,
  getMySubmission,
} from '../../controllers/student/examController.js';
import {
  autoSaveProgress,
  getSavedProgress
} from '../../controllers/student/autoSaveController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', listPublishedExams);
router.get('/:id', [param('id').isString().isLength({ min: 12 })], getPublishedExam);

// Get saved progress
router.get('/:id/saved-progress', [param('id').isString().isLength({ min: 12 })], asyncHandler(getSavedProgress));

router.post('/:id/start', [param('id').isString().isLength({ min: 12 })], startAttempt);

// Auto-save progress
router.post(
  '/:id/auto-save',
  [
    param('id').isString().isLength({ min: 12 }),
    body('answers').isArray()
  ],
  asyncHandler(autoSaveProgress)
);

router.post(
  '/:id/submit',
  [
    param('id').isString().isLength({ min: 12 }),
    body('mcqAnswers').optional().isArray(),
    body('codingAnswers').optional().isArray(),
  ],
  submitAttempt
);

router.get('/:id/submission', [param('id').isString().isLength({ min: 12 })], getMySubmission);

export default router;
