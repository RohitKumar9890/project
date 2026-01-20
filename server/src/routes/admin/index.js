import { Router } from 'express';
import semesterRoutes from './semesterRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import userRoutes from './userRoutes.js';
import sectionRoutes from './sectionRoutes.js';
import { exportUsersToExcel, exportExamResults, exportAllSubmissions, downloadUserTemplate } from '../../controllers/admin/exportController.js';
import { bulkImportUsers } from '../../controllers/admin/importController.js';
import { upload } from '../../config/multer.js';

const router = Router();

router.use('/semesters', semesterRoutes);
router.use('/subjects', subjectRoutes);
router.use('/users', userRoutes);
router.use('/sections', sectionRoutes);

// Excel export routes
router.get('/export/users', exportUsersToExcel);
router.get('/export/exam/:examId', exportExamResults);
router.get('/export/submissions', exportAllSubmissions);
router.get('/export/template', downloadUserTemplate);

// Excel import routes
router.post('/import/users', upload.single('file'), bulkImportUsers);

export default router;
