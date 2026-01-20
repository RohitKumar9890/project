import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Material } from '../../models/Material.js';
import { Subject } from '../../models/Subject.js';

export const listMaterials = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;

  // Only materials for subjects the faculty teaches
  const mySubjects = await Subject.find({ facultyId: req.user.id });
  const mySubjectIds = mySubjects.map((s) => s.id || s._id);
  
  if (!filter.subjectId) {
    // If no specific subject requested, get all materials for faculty's subjects
    const allMaterials = await Material.find();
    const materials = allMaterials.filter(m => mySubjectIds.includes(m.subjectId));
    materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ materials });
  }
  
  // Check if requested subject belongs to this faculty
  if (!mySubjectIds.includes(filter.subjectId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const materials = await Material.find(filter);
  materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ materials });
});

export const createMaterial = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) return res.status(400).json({ message: 'Invalid subjectId' });
  if (subject.facultyId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only upload materials for your own subjects' });
  }

  const material = await Material.create({
    subjectId: req.body.subjectId,
    uploadedBy: req.user.id,
    title: req.body.title,
    type: req.body.type,
    fileUrl: req.body.fileUrl,
    linkUrl: req.body.linkUrl,
  });

  res.status(201).json({ material });
});

export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user.id });
  if (!material) return res.status(404).json({ message: 'Material not found' });
  
  await Material.deleteById(req.params.id);
  res.json({ success: true });
});
