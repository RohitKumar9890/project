import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listMaterials,
  createMaterial,
  deleteMaterial,
} from '../../controllers/faculty/materialController.js';

const router = Router();

router.get('/', listMaterials);

router.post(
  '/',
  [
    body('subjectId').isString().isLength({ min: 12 }),
    body('title').isString().isLength({ min: 1 }),
    body('type').optional().isIn(['pdf', 'doc', 'link', 'video', 'other']),
    body('fileUrl').optional().isString(),
    body('linkUrl').optional().isString(),
  ],
  createMaterial
);

router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteMaterial);

export default router;
