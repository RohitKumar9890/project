import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject,
} from '../../controllers/admin/subjectController.js';

const router = Router();

router.get('/', listSubjects);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1 }),
    body('code').isString().isLength({ min: 2 }),
    body('semesterId').isString().isLength({ min: 12 }),
    body('facultyId').isString().isLength({ min: 12 }),
    body('syllabus').optional().isObject(),
  ],
  createSubject
);

router.patch(
  '/:id',
  [param('id').isString()],
  updateSubject
);

router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteSubject);

export default router;
