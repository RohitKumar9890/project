import { validationResult } from 'express-validator';
import { Section } from '../../models/Section.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listSections = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.semesterId) filter.semesterId = req.query.semesterId;
  if (req.query.facultyId) filter.facultyId = req.query.facultyId;

  const sections = await Section.find(filter);
  res.json({ sections });
});

export const createSection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const section = await Section.create(req.body);
  res.status(201).json({ section });
});

export const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });

  const updated = await Section.updateById(req.params.id, req.body);
  res.json({ section: updated });
});

export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) return res.status(404).json({ message: 'Section not found' });

  await Section.deleteById(req.params.id);
  res.json({ message: 'Section deleted' });
});

export const enrollStudentInSection = asyncHandler(async (req, res) => {
  const { sectionId, studentId } = req.body;
  
  const section = await Section.enrollStudent(sectionId, studentId);
  res.json({ message: 'Student enrolled successfully', section });
});

export const unenrollStudentFromSection = asyncHandler(async (req, res) => {
  const { sectionId, studentId } = req.body;
  
  const section = await Section.unenrollStudent(sectionId, studentId);
  res.json({ message: 'Student unenrolled successfully', section });
});
