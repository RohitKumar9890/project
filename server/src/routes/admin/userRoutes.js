import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
} from '../../controllers/admin/userController.js';

const router = Router();

router.get('/', listUsers);

router.post(
  '/',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('role').isIn(['admin', 'faculty', 'student']),
  ],
  createUser
);

router.patch('/:id', [param('id').isString()], updateUser);
router.delete('/:id', [param('id').isString()], deleteUser);

router.post('/:id/deactivate', [param('id').isString()], deactivateUser);
router.post('/:id/activate', [param('id').isString()], activateUser);

export default router;
