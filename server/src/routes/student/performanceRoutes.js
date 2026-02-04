import { Router } from 'express';
import {
  getExamHistory,
  getPerformanceAnalytics,
  getSubjectPerformance,
  getPerformanceDashboard
} from '../../controllers/student/performanceController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Performance dashboard
router.get('/dashboard', asyncHandler(getPerformanceDashboard));

// Exam history
router.get('/history', asyncHandler(getExamHistory));

// Performance analytics
router.get('/analytics', asyncHandler(getPerformanceAnalytics));

// Subject-specific performance
router.get('/subject/:subjectId', asyncHandler(getSubjectPerformance));

export default router;
