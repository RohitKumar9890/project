import { Router } from 'express';
import examRoutes from './examRoutes.js';
import { getMyProgress } from '../../controllers/student/progressController.js';
import { joinExamByCode, getMyEnrolledExams } from '../../controllers/student/enrollmentController.js';

const router = Router();

router.get('/progress', getMyProgress);
router.post('/join-exam', joinExamByCode);
router.get('/my-exams', getMyEnrolledExams);
router.use('/exams', examRoutes);

export default router;
