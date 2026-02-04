import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  createTemplateFromExam,
  updateTemplate,
  deleteTemplate,
  createExamFromTemplate,
  cloneExam
} from '../../controllers/faculty/examTemplateController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Get all templates
router.get('/', asyncHandler(getTemplates));

// Get single template
router.get('/:id', asyncHandler(getTemplate));

// Create new template
router.post(
  '/',
  [
    body('name').isString().isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
    body('type').isIn(['mcq', 'quiz', 'coding']).withMessage('Invalid exam type'),
    body('subjectId').isString().notEmpty().withMessage('Subject ID is required'),
    body('durationMinutes').isInt({ min: 1, max: 480 }).withMessage('Duration must be 1-480 minutes'),
    body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
    body('description').optional().isString(),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray(),
    body('category').optional().isString(),
  ],
  asyncHandler(createTemplate)
);

// Create template from existing exam
router.post(
  '/from-exam/:examId',
  [
    body('name').optional().isString().isLength({ min: 3, max: 200 }),
    body('description').optional().isString(),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray(),
    body('category').optional().isString(),
  ],
  asyncHandler(createTemplateFromExam)
);

// Update template
router.put(
  '/:id',
  [
    body('name').optional().isString().isLength({ min: 3, max: 200 }),
    body('description').optional().isString(),
    body('durationMinutes').optional().isInt({ min: 1, max: 480 }),
    body('totalMarks').optional().isInt({ min: 1 }),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray(),
  ],
  asyncHandler(updateTemplate)
);

// Delete template
router.delete('/:id', asyncHandler(deleteTemplate));

// Create exam from template
router.post(
  '/:id/create-exam',
  [
    body('title').isString().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('startsAt').optional().isISO8601().toDate(),
    body('endsAt').optional().isISO8601().toDate(),
    body('isPublished').optional().isBoolean(),
  ],
  asyncHandler(createExamFromTemplate)
);

export default router;
