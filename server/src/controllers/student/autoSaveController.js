import { asyncHandler } from '../../utils/asyncHandler.js';
import { Submission } from '../../models/Submission.js';
import { Exam } from '../../models/Exam.js';

/**
 * Auto-save exam progress
 * @route POST /api/student/exams/:examId/auto-save
 */
export const autoSaveProgress = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;
  const { answers } = req.body;
  
  // Verify exam exists and is published
  const exam = await Exam.findOne({ _id: examId, isPublished: true });
  
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  
  // Find or create submission
  let submission = await Submission.findOne({ 
    examId, 
    studentId 
  });
  
  if (!submission) {
    // Create new submission if doesn't exist
    submission = await Submission.create({
      examId,
      studentId,
      status: 'in_progress',
      answers: answers || [],
      score: 0,
      maxScore: exam.totalMarks || 0
    });
  } else {
    // Update existing submission
    submission = await Submission.updateById(submission._id || submission.id, {
      answers: answers || [],
      lastSavedAt: new Date()
    });
  }
  
  res.json({
    message: 'Progress saved',
    submissionId: submission._id || submission.id,
    savedAt: new Date(),
    answerCount: answers?.length || 0
  });
});

/**
 * Get saved progress for an exam
 * @route GET /api/student/exams/:examId/saved-progress
 */
export const getSavedProgress = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;
  
  const submission = await Submission.findOne({ 
    examId, 
    studentId,
    status: 'in_progress'
  });
  
  if (!submission) {
    return res.json({
      hasSavedProgress: false,
      answers: []
    });
  }
  
  res.json({
    hasSavedProgress: true,
    answers: submission.answers || [],
    lastSavedAt: submission.lastSavedAt || submission.updatedAt,
    submissionId: submission._id || submission.id
  });
});
