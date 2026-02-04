import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ExamTemplate } from '../../models/ExamTemplate.js';
import { Exam } from '../../models/Exam.js';
import { Subject } from '../../models/Subject.js';
import { AuditLog } from '../../models/AuditLog.js';

/**
 * Get all templates accessible to faculty
 * @route GET /api/faculty/exam-templates
 */
export const getTemplates = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  
  const filters = {};
  if (req.query.subjectId) filters.subjectId = req.query.subjectId;
  if (req.query.type) filters.type = req.query.type;
  if (req.query.category) filters.category = req.query.category;
  
  const templates = await ExamTemplate.findAccessible(facultyId, filters);
  
  // Populate subject info
  for (let i = 0; i < templates.length; i++) {
    if (templates[i].subjectId) {
      const subject = await Subject.findById(templates[i].subjectId);
      if (subject) {
        templates[i].subject = {
          id: subject.id || subject._id,
          name: subject.name,
          code: subject.code
        };
      }
    }
  }
  
  res.json({ 
    templates,
    total: templates.length
  });
});

/**
 * Get single template
 * @route GET /api/faculty/exam-templates/:id
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const template = await ExamTemplate.findById(req.params.id);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  // Check access
  if (template.createdBy !== req.user.id && !template.isPublic) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Populate subject
  if (template.subjectId) {
    const subject = await Subject.findById(template.subjectId);
    if (subject) {
      template.subject = {
        id: subject.id || subject._id,
        name: subject.name,
        code: subject.code
      };
    }
  }
  
  res.json({ template });
});

/**
 * Create new template
 * @route POST /api/faculty/exam-templates
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const templateData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  const template = await ExamTemplate.create(templateData);
  
  // Log creation
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_template_created',
    resourceType: 'exam_template',
    resourceId: template._id || template.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { 
      name: template.name,
      subjectId: template.subjectId,
      type: template.type
    }
  });
  
  res.status(201).json({ 
    message: 'Template created successfully',
    template 
  });
});

/**
 * Create template from existing exam
 * @route POST /api/faculty/exam-templates/from-exam/:examId
 */
export const createTemplateFromExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  
  // Only creator can create template from exam
  if (exam.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const templateData = {
    name: req.body.name || `${exam.title} Template`,
    description: req.body.description || `Template created from ${exam.title}`,
    type: exam.type,
    subjectId: exam.subjectId,
    durationMinutes: exam.durationMinutes,
    totalMarks: exam.totalMarks,
    mcqQuestions: exam.mcqQuestions || [],
    codingQuestions: exam.codingQuestions || [],
    instructions: exam.instructions || '',
    passingMarks: exam.passingMarks || null,
    randomizeQuestions: exam.randomizeQuestions || false,
    showResultsImmediately: exam.showResultsImmediately || false,
    allowReview: exam.allowReview || false,
    createdBy: req.user.id,
    isPublic: req.body.isPublic || false,
    tags: req.body.tags || [],
    category: req.body.category || 'general'
  };
  
  const template = await ExamTemplate.create(templateData);
  
  // Log creation
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_template_created_from_exam',
    resourceType: 'exam_template',
    resourceId: template._id || template.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { 
      sourceExamId: req.params.examId,
      name: template.name
    }
  });
  
  res.status(201).json({ 
    message: 'Template created from exam successfully',
    template 
  });
});

/**
 * Update template
 * @route PUT /api/faculty/exam-templates/:id
 */
export const updateTemplate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const template = await ExamTemplate.findById(req.params.id);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  // Only creator can update
  if (template.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the creator can update this template' });
  }
  
  const updated = await ExamTemplate.updateById(req.params.id, req.body);
  
  // Log update
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_template_updated',
    resourceType: 'exam_template',
    resourceId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ 
    message: 'Template updated successfully',
    template: updated 
  });
});

/**
 * Delete template
 * @route DELETE /api/faculty/exam-templates/:id
 */
export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await ExamTemplate.findById(req.params.id);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  // Only creator can delete
  if (template.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the creator can delete this template' });
  }
  
  await ExamTemplate.deleteById(req.params.id);
  
  // Log deletion
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_template_deleted',
    resourceType: 'exam_template',
    resourceId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.json({ message: 'Template deleted successfully' });
});

/**
 * Create exam from template
 * @route POST /api/faculty/exam-templates/:id/create-exam
 */
export const createExamFromTemplate = asyncHandler(async (req, res) => {
  const template = await ExamTemplate.findById(req.params.id);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  // Check access
  if (template.createdBy !== req.user.id && !template.isPublic) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const examData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  const exam = await ExamTemplate.createExamFromTemplate(req.params.id, examData);
  
  // Log exam creation from template
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_created_from_template',
    resourceType: 'exam',
    resourceId: exam._id || exam.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { 
      templateId: req.params.id,
      templateName: template.name
    }
  });
  
  res.status(201).json({ 
    message: 'Exam created from template successfully',
    exam 
  });
});

/**
 * Clone an existing exam
 * @route POST /api/faculty/exams/:id/clone
 */
export const cloneExam = asyncHandler(async (req, res) => {
  const originalExam = await Exam.findById(req.params.id);
  
  if (!originalExam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  
  // Only creator can clone their own exam
  if (originalExam.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Create cloned exam
  const clonedExam = await Exam.create({
    title: req.body.title || `${originalExam.title} (Copy)`,
    type: originalExam.type,
    subjectId: originalExam.subjectId,
    createdBy: req.user.id,
    durationMinutes: req.body.durationMinutes || originalExam.durationMinutes,
    totalMarks: req.body.totalMarks || originalExam.totalMarks,
    startsAt: req.body.startsAt || null,
    endsAt: req.body.endsAt || null,
    isPublished: false, // Always start as unpublished
    mcqQuestions: originalExam.mcqQuestions || [],
    codingQuestions: originalExam.codingQuestions || [],
    instructions: originalExam.instructions || '',
    passingMarks: originalExam.passingMarks,
    randomizeQuestions: originalExam.randomizeQuestions,
    showResultsImmediately: originalExam.showResultsImmediately,
    allowReview: originalExam.allowReview
  });
  
  // Log cloning
  await AuditLog.create({
    userId: req.user.id,
    action: 'exam_cloned',
    resourceType: 'exam',
    resourceId: clonedExam._id || clonedExam.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { 
      originalExamId: req.params.id,
      originalTitle: originalExam.title
    }
  });
  
  res.status(201).json({ 
    message: 'Exam cloned successfully',
    exam: clonedExam 
  });
});
