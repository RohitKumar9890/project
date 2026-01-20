import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../controllers/faculty/announcementController.js';

const router = Router();

router.get('/', listAnnouncements);

router.post(
  '/',
  [
    body('subjectId').isString().isLength({ min: 12 }),
    body('title').isString().isLength({ min: 1 }),
    body('content').isString().isLength({ min: 1 }),
  ],
  createAnnouncement
);

router.delete('/:id', [param('id').isString().isLength({ min: 12 })], deleteAnnouncement);

export default router;
