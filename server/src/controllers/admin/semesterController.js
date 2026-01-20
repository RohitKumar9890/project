import { validationResult } from 'express-validator';
import { Semester } from '../../models/Semester.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listSemesters = asyncHandler(async (_req, res) => {
  const semesters = await Semester.find();
  // Sort in JavaScript since Firestore doesn't support chained .sort()
  semesters.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return new Date(b.startDate) - new Date(a.startDate);
  });
  res.json({ semesters });
});

export const createSemester = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const semester = await Semester.create({
    name: req.body.name,
    year: req.body.year,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
  });

  res.status(201).json({ semester });
});

export const updateSemester = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const updates = {};
  for (const key of ['name', 'year', 'startDate', 'endDate', 'isActive']) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.startDate) updates.startDate = new Date(updates.startDate);
  if (updates.endDate) updates.endDate = new Date(updates.endDate);

  const semester = await Semester.updateById(req.params.id, updates);
  if (!semester) return res.status(404).json({ message: 'Semester not found' });

  res.json({ semester });
});

export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);
  if (!semester) return res.status(404).json({ message: 'Semester not found' });
  await Semester.deleteById(req.params.id);
  res.json({ success: true });
});
