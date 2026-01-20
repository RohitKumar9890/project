import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Announcement } from '../../models/Announcement.js';
import { Subject } from '../../models/Subject.js';

export const listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;

  // Only announcements for subjects the faculty teaches
  const mySubjects = await Subject.find({ facultyId: req.user.id });
  const mySubjectIds = mySubjects.map((s) => s.id || s._id);
  
  if (!filter.subjectId) {
    // If no specific subject requested, get all announcements for faculty's subjects
    const allAnnouncements = await Announcement.find();
    const announcements = allAnnouncements.filter(a => mySubjectIds.includes(a.subjectId));
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ announcements });
  }
  
  // Check if requested subject belongs to this faculty
  if (!mySubjectIds.includes(filter.subjectId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const announcements = await Announcement.find(filter);
  announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ announcements });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).json({ message: 'Invalid subjectId' });
  if (subject.facultyId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only post announcements for your own subjects' });
  }

  const announcement = await Announcement.create({
    subjectId: req.body.subjectId,
    postedBy: req.user.id,
    title: req.body.title,
    content: req.body.content,
  });

  res.status(201).json({ announcement });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({
    _id: req.params.id,
    postedBy: req.user.id,
  });
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
  
  await Announcement.deleteById(req.params.id);
  res.json({ success: true });
});
