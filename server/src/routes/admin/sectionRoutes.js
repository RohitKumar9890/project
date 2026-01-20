import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  enrollStudentInSection,
  unenrollStudentFromSection,
} from '../../controllers/admin/sectionController.js';

const router = Router();

router.get('/', listSections);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1 }),
    body('subjectId').isString(),
    body('facultyId').isString(),
    body('semesterId').isString(),
  ],
  createSection
);

router.patch('/:id', [param('id').isString()], updateSection);

router.delete('/:id', [param('id').isString()], deleteSection);

router.post('/enroll', [body('sectionId').isString(), body('studentId').isString()], enrollStudentInSection);

router.post('/unenroll', [body('sectionId').isString(), body('studentId').isString()], unenrollStudentFromSection);

export default router;
