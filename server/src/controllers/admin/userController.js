import { validationResult } from 'express-validator';
import { User } from '../../models/User.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { hashPassword } from '../../utils/password.js';

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter);
  // Remove passwordHash from response
  const sanitizedUsers = users.map(user => ({
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive !== false,
  }));
  res.json({ users: sanitizedUsers });
});

export const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const email = req.body.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await hashPassword(req.body.password);
  const user = await User.create({
    name: req.body.name,
    email,
    passwordHash,
    role: req.body.role,
    isActive: true,
  });

  res.status(201).json({ user: { id: user.id || user._id, name: user.name, email: user.email, role: user.role, isActive: true } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = await User.updateById(req.params.id, req.body);
  res.json({ user: { id: updated.id || updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await User.deleteById(req.params.id);
  res.json({ message: 'User deleted' });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = await User.updateById(req.params.id, { isActive: false });
  res.json({ user: { id: updated.id || updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: false } });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = await User.updateById(req.params.id, { isActive: true });
  res.json({ user: { id: updated.id || updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: true } });
});
