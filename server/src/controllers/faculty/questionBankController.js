import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { QuestionBank, QUESTION_TYPES, DIFFICULTY_LEVELS } from '../../models/QuestionBank.js';
import { Subject } from '../../models/Subject.js';
import { AuditLog } from '../../models/AuditLog.js';

/**
 * Get all questions accessible to the faculty member
 * @route GET /api/faculty/question-bank
 */
export const getQuestions = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  
  // Get filter parameters
  const filters = {};
  if (req.query.subjectId) filters.subjectId = req.query.subjectId;
  if (req.query.type) filters.type = req.query.type;
  if (req.query.difficulty) filters.difficulty = req.query.difficulty;
  
  // Get questions (own + public)
  const questions = await QuestionBank.findAccessible(facultyId, filters);
  
  // Populate subject info
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].subjectId) {
      const subject = await Subject.findById(questions[i].subjectId);
      if (subject) {
        questions[i].subject = {
          id: subject.id || subject._id,
          name: subject.name,
          code: subject.code
        };
      }
    }
  }
  
  res.json({ 
    questions,
    total: questions.length
  });
});

/**
 * Search questions
 * @route GET /api/faculty/question-bank/search
 */
export const searchQuestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const facultyId = req.user.id;
  
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  // Get filter parameters
  const filters = { createdBy: facultyId };
  if (req.query.subjectId) filters.subjectId = req.query.subjectId;
  if (req.query.type) filters.type = req.query.type;
  if (req.query.difficulty) filters.difficulty = req.query.difficulty;
  
  const questions = await QuestionBank.search(q, filters);
  
  res.json({ 
    questions,
    total: questions.length,
    query: q
  });
});

/**
 * Get a single question by ID
 * @route GET /api/faculty/question-bank/:id
 */
export const getQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionBank.findById(req.params.id);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  // Check if user has access (own question or public)
  if (question.createdBy !== req.user.id && !question.isPublic) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Populate subject
  if (question.subjectId) {
    const subject = await Subject.findById(question.subjectId);
    if (subject) {
      question.subject = {
        id: subject.id || subject._id,
        name: subject.name,
        code: subject.code
      };
    }
  }
  
  res.json({ question });
});

/**
 * Create a new question
 * @route POST /api/faculty/question-bank
 */
export const createQuestion = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const questionData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  // Validate question type-specific fields
  if (questionData.type === QUESTION_TYPES.MCQ) {
    if (!questionData.options || questionData.options.length < 2) {
      return res.status(400).json({ message: 'MCQ must have at least 2 options' });
    }
    if (questionData.correctOptionIndex === undefined || questionData.correctOptionIndex === null) {
      return res.status(400).json({ message: 'MCQ must have a correct option index' });
    }
  }
  
  if (questionData.type === QUESTION_TYPES.CODING) {
    if (!questionData.language) {
      return res.status(400).json({ message: 'Coding question must specify a language' });
    }
  }
  
  const question = await QuestionBank.create(questionData);
  
  // Log creation
  await AuditLog.create({
    userId: req.user.id,
    action: 'question_bank_created',
    resourceType: 'question',
    resourceId: question._id || question.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { 
      type: question.type,
      subjectId: question.subjectId,
      difficulty: question.difficulty
    }
  });
  
  res.status(201).json({ 
    message: 'Question created successfully',
    question 
  });
});

/**
 * Update a question
 * @route PUT /api/faculty/question-bank/:id
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const question = await QuestionBank.findById(req.params.id);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  // Only creator can update
  if (question.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the creator can update this question' });
  }
  
  const updated = await QuestionBank.updateById(req.params.id, req.body);
  
  // Log update
  await AuditLog.create({
    userId: req.user.id,
    action: 'question_bank_updated',
    resourceType: 'question',
    resourceId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ 
    message: 'Question updated successfully',
    question: updated 
  });
});

/**
 * Delete a question (soft delete)
 * @route DELETE /api/faculty/question-bank/:id
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionBank.findById(req.params.id);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  // Only creator can delete
  if (question.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the creator can delete this question' });
  }
  
  await QuestionBank.deleteById(req.params.id);
  
  // Log deletion
  await AuditLog.create({
    userId: req.user.id,
    action: 'question_bank_deleted',
    resourceType: 'question',
    resourceId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ message: 'Question deleted successfully' });
});

/**
 * Duplicate a question
 * @route POST /api/faculty/question-bank/:id/duplicate
 */
export const duplicateQuestion = asyncHandler(async (req, res) => {
  const original = await QuestionBank.findById(req.params.id);
  
  if (!original) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  // Check access
  if (original.createdBy !== req.user.id && !original.isPublic) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const duplicate = await QuestionBank.duplicate(
    req.params.id,
    req.user.id,
    req.body
  );
  
  // Log duplication
  await AuditLog.create({
    userId: req.user.id,
    action: 'question_bank_duplicated',
    resourceType: 'question',
    resourceId: duplicate._id || duplicate.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { originalId: req.params.id }
  });
  
  res.status(201).json({ 
    message: 'Question duplicated successfully',
    question: duplicate 
  });
});

/**
 * Get statistics for a subject's question bank
 * @route GET /api/faculty/question-bank/stats/:subjectId
 */
export const getSubjectStats = asyncHandler(async (req, res) => {
  const stats = await QuestionBank.getSubjectStats(req.params.subjectId);
  
  res.json({ stats });
});

/**
 * Get available question types and difficulty levels
 * @route GET /api/faculty/question-bank/meta
 */
export const getMetadata = asyncHandler(async (req, res) => {
  res.json({
    questionTypes: Object.values(QUESTION_TYPES),
    difficultyLevels: Object.values(DIFFICULTY_LEVELS)
  });
});
