import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listPublishedExams,
  getPublishedExam,
  startAttempt,
  submitAttempt,
  getMySubmission,
} from '../../controllers/student/examController.js';

const router = Router();

router.get('/', listPublishedExams);
router.get('/:id', [param('id').isString().isLength({ min: 12 })], getPublishedExam);

router.post('/:id/start', [param('id').isString().isLength({ min: 12 })], startAttempt);

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
