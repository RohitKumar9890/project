import { Router } from 'express';
import {
  getExamAnalytics,
  getSubjectAnalytics,
  getDashboardOverview,
  getStudentComparison
} from '../../controllers/faculty/analyticsController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Dashboard overview
router.get('/dashboard', asyncHandler(getDashboardOverview));

// Exam analytics
router.get('/exam/:examId', asyncHandler(getExamAnalytics));

// Student comparison for an exam
router.get('/exam/:examId/students', asyncHandler(getStudentComparison));

// Subject analytics
router.get('/subject/:subjectId', asyncHandler(getSubjectAnalytics));

export default router;
