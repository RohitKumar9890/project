import { validationResult } from 'express-validator';
import { Subject } from '../../models/Subject.js';
import { Semester } from '../../models/Semester.js';
import { User, USER_ROLES } from '../../models/User.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listSubjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.semesterId) filter.semesterId = req.query.semesterId;

  let subjects = await Subject.find(filter);
  
  // Manually populate since Firestore doesn't support .populate()
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].semesterId) {
      const semester = await Semester.findById(subjects[i].semesterId);
      if (semester) {
        subjects[i].semester = { id: semester.id, name: semester.name, year: semester.year };
      }
    }
    if (subjects[i].facultyId) {
      const faculty = await User.findById(subjects[i].facultyId);
      if (faculty) {
        subjects[i].faculty = { id: faculty.id, name: faculty.name, email: faculty.email, role: faculty.role };
      }
    }
  }
  
  // Sort by createdAt descending
  subjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ subjects });
});

export const createSubject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const semester = await Semester.findById(req.body.semesterId);
  if (!semester) return res.status(400).json({ message: 'Invalid semesterId' });

  if (req.body.facultyId) {
    const faculty = await User.findById(req.body.facultyId);
    if (!faculty || faculty.role !== USER_ROLES.FACULTY) {
      return res.status(400).json({ message: 'facultyId must reference a faculty user' });
    }
  }

  const subject = await Subject.create({
    name: req.body.name,
    code: req.body.code,
    semesterId: req.body.semesterId,
    facultyId: req.body.facultyId,
    syllabus: req.body.syllabus,
  });

  res.status(201).json({ subject });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const updates = {};
  for (const key of ['name', 'code', 'semesterId', 'facultyId', 'syllabus', 'isActive']) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (updates.semesterId) {
    const semester = await Semester.findById(updates.semesterId);
    if (!semester) return res.status(400).json({ message: 'Invalid semesterId' });
  }

  if (updates.facultyId) {
    const faculty = await User.findById(updates.facultyId);
    if (!faculty || faculty.role !== USER_ROLES.FACULTY) {
      return res.status(400).json({ message: 'facultyId must reference a faculty user' });
    }
  }

  const subject = await Subject.updateById(req.params.id, updates);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  res.json({ subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  await Subject.deleteById(req.params.id);
  res.json({ success: true });
});
