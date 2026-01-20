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

router.post('/:id/publish', [param('id').isString().isLength({ min: 12 })], publishExam);
router.post('/:id/unpublish', [param('id').isString().isLength({ min: 12 })], unpublishExam);
router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteExam);

export default router;
