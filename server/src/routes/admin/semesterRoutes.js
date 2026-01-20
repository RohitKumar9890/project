import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createSemester,
  listSemesters,
  updateSemester,
  deleteSemester,
} from '../../controllers/admin/semesterController.js';

const router = Router();

router.get('/', listSemesters);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 1 }),
    body('year').isInt({ min: 2000, max: 3000 }),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ],
  createSemester
);

router.patch(
  '/:id',
  [param('id').isString()],
  updateSemester
);

router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteSemester);

export default router;
