import { Router } from 'express';
import { body } from 'express-validator';
import {
  getQuestions,
  searchQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  getSubjectStats,
  getMetadata
} from '../../controllers/faculty/questionBankController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Get metadata (question types, difficulty levels)
router.get('/meta', asyncHandler(getMetadata));

// Search questions
router.get('/search', asyncHandler(searchQuestions));

// Get subject statistics
router.get('/stats/:subjectId', asyncHandler(getSubjectStats));

// Get all questions (with filters)
router.get('/', asyncHandler(getQuestions));

// Get single question
router.get('/:id', asyncHandler(getQuestion));

// Create new question
router.post(
  '/',
  [
    body('type').isIn(['mcq', 'coding', 'short_answer', 'essay']).withMessage('Invalid question type'),
    body('prompt').isString().isLength({ min: 10, max: 5000 }).withMessage('Prompt must be 10-5000 characters'),
    body('subjectId').isString().notEmpty().withMessage('Subject ID is required'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('marks').optional().isInt({ min: 1, max: 100 }),
    body('title').optional().isString().isLength({ max: 200 }),
    body('topics').optional().isArray(),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean(),
    
    // MCQ specific
    body('options').optional().isArray(),
    body('correctOptionIndex').optional().isInt({ min: 0 }),
    
    // Coding specific
    body('language').optional().isIn(['javascript', 'python']),
    body('starterCode').optional().isString(),
    body('solution').optional().isString(),
    body('testCases').optional().isArray(),
  ],
  asyncHandler(createQuestion)
);

// Update question
router.put(
  '/:id',
  [
    body('prompt').optional().isString().isLength({ min: 10, max: 5000 }),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('marks').optional().isInt({ min: 1, max: 100 }),
    body('title').optional().isString().isLength({ max: 200 }),
    body('topics').optional().isArray(),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean(),
    body('options').optional().isArray(),
    body('correctOptionIndex').optional().isInt({ min: 0 }),
  ],
  asyncHandler(updateQuestion)
);

// Duplicate question
router.post(
  '/:id/duplicate',
  [
    body('title').optional().isString().isLength({ max: 200 }),
    body('isPublic').optional().isBoolean(),
  ],
  asyncHandler(duplicateQuestion)
);

// Delete question
router.delete('/:id', asyncHandler(deleteQuestion));

export default router;
