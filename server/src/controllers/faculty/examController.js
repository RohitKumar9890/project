import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Exam } from '../../models/Exam.js';
import { Subject } from '../../models/Subject.js';

export const listMyExams = asyncHandler(async (req, res) => {
  let exams = await Exam.find({ createdBy: req.user.id });
  
  // Sort by createdAt descending
  exams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Manually populate subject info
  for (let i = 0; i < exams.length; i++) {
    if (exams[i].subjectId) {
      const subject = await Subject.findById(exams[i].subjectId);
      if (subject) {
        exams[i].subject = { id: subject.id, name: subject.name, code: subject.code };
      }
    }
  }
  
  res.json({ exams });
});

export const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  
  // Populate subject info
  if (exam.subjectId) {
    const subject = await Subject.findById(exam.subjectId);
    if (subject) {
      exam.subject = { id: subject.id, name: subject.name, code: subject.code };
    }
  }
  
  res.json({ exam });
});

export const createExam = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Ensure subject belongs to this faculty
  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).json({ message: 'Invalid subjectId' });
  if (subject.facultyId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only create exams for your own subjects' });
  }

  const exam = await Exam.create({
    subjectId: req.body.subjectId,
    createdBy: req.user.id,
    title: req.body.title,
    type: req.body.type,
    duration: req.body.duration,
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
    questions: req.body.questions || [],
    isPublished: req.body.isPublished || false,
    joinCode: req.body.joinCode,
  });

  res.status(201).json({ exam });
});

export const updateExam = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  const updates = {};
  for (const key of ['title', 'type', 'duration', 'startTime', 'endTime', 'questions', 'isPublished', 'joinCode']) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }
  if (updates.startTime) updates.startTime = new Date(updates.startTime);
  if (updates.endTime) updates.endTime = new Date(updates.endTime);

  const updatedExam = await Exam.updateById(req.params.id, updates);
  res.json({ exam: updatedExam });
});

export const publishExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  
  const updatedExam = await Exam.updateById(req.params.id, { isPublished: true });
  res.json({ exam: updatedExam });
});

export const unpublishExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  
  const updatedExam = await Exam.updateById(req.params.id, { isPublished: false });
  res.json({ exam: updatedExam });
});

export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  
  await Exam.deleteById(req.params.id);
  res.json({ success: true });
});
