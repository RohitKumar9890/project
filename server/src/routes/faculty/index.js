import { Router } from 'express';
import examRoutes from './examRoutes.js';
import materialRoutes from './materialRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import questionBankRoutes from './questionBankRoutes.js';
import examTemplateRoutes from './examTemplateRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { getMySubjects } from '../../controllers/faculty/subjectController.js';

const router = Router();

router.get('/subjects', getMySubjects);
router.use('/exams', examRoutes);
router.use('/exam-templates', examTemplateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/materials', materialRoutes);
router.use('/announcements', announcementRoutes);
router.use('/submissions', submissionRoutes);
router.use('/question-bank', questionBankRoutes);

export default router;
