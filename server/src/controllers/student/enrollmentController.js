import { Exam } from '../../models/Exam.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { FieldValue } from '../../config/firebase.js';

export const joinExamByCode = asyncHandler(async (req, res) => {
  const { examCode } = req.body;
  
  if (!examCode) {
    return res.status(400).json({ message: 'Exam code is required' });
  }

  // Find exam by code
  const exam = await Exam.findOne({ examCode: examCode.toUpperCase() });
  
  if (!exam) {
    return res.status(404).json({ message: 'Invalid exam code' });
  }

  if (!exam.isPublished) {
    return res.status(403).json({ message: 'This exam is not yet published' });
  }

  // Check if student already enrolled
  const enrolledStudents = exam.enrolledStudents || [];
  if (enrolledStudents.includes(req.user.id)) {
    return res.status(400).json({ message: 'You are already enrolled in this exam' });
  }

  // Add student to enrolled list
  await Exam.updateById(exam.id || exam._id, {
    enrolledStudents: [...enrolledStudents, req.user.id],
  });

  res.json({ 
    message: 'Successfully joined the exam!',
    exam: {
      id: exam.id || exam._id,
      title: exam.title,
      type: exam.type,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
    }
  });
});

export const getMyEnrolledExams = asyncHandler(async (req, res) => {
  // Get all exams where student is enrolled
  const allExams = await Exam.find({ isPublished: true });
  
  // Filter to only exams this student is enrolled in
  const myExams = allExams.filter(exam => {
    const enrolledStudents = exam.enrolledStudents || [];
    return enrolledStudents.includes(req.user.id);
  });

  res.json({ exams: myExams });
});
