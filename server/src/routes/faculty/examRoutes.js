import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createExam,
  listMyExams,
  getExam,
  updateExam,
  publishExam,
  unpublishExam,
  deleteExam,
} from '../../controllers/faculty/examController.js';
import { cloneExam } from '../../controllers/faculty/examTemplateController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', listMyExams);
router.post(
  '/',
  [
    body('title').isString().isLength({ min: 1 }),
    body('type').isIn(['mcq', 'quiz', 'coding']),
    body('subjectId').isString().isLength({ min: 12 }),
    body('durationMinutes').isInt({ min: 1 }),
    body('totalMarks').isInt({ min: 0 }),
    body('mcqQuestions').optional().isArray(),
    body('codingQuestions').optional().isArray(),
  ],
  createExam
);

router.get('/:id', [param('id').isString().isLength({ min: 12 })], getExam);

router.patch(
  '/:id',
  [param('id').isString()],
  updateExam
);

// Clone exam
router.post(
  '/:id/clone',
  [
    param('id').isString().isLength({ min: 12 }),
    body('title').optional().isString().isLength({ min: 3, max: 200 }),
    body('durationMinutes').optional().isInt({ min: 1, max: 480 }),
    body('totalMarks').optional().isInt({ min: 1 }),
    body('startsAt').optional().isISO8601().toDate(),
    body('endsAt').optional().isISO8601().toDate(),
  ],
  asyncHandler(cloneExam)
);

router.post('/:id/publish', [param('id').isString().isLength({ min: 12 })], publishExam);
router.post('/:id/unpublish', [param('id').isString().isLength({ min: 12 })], unpublishExam);
router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteExam);

export default router;
