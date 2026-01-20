import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Exam } from '../../models/Exam.js';
import { Submission } from '../../models/Submission.js';

const sanitizeExamForStudent = (exam) => {
  if (!exam) return exam;
  const copy = { ...exam };

  // Remove correct answers / hidden testcases
  if (Array.isArray(copy.mcqQuestions)) {
    copy.mcqQuestions = copy.mcqQuestions.map((q) => ({
      prompt: q.prompt,
      marks: q.marks,
      difficulty: q.difficulty,
      options: q.options,
    }));
  }

  if (Array.isArray(copy.codingQuestions)) {
    copy.codingQuestions = copy.codingQuestions.map((q) => ({
      prompt: q.prompt,
      marks: q.marks,
      difficulty: q.difficulty,
      starterCode: q.starterCode,
      language: q.language,
      testCases: (q.testCases || []).filter((t) => !t.isHidden).map((t) => ({ input: t.input })),
    }));
  }

  return copy;
};

export const listPublishedExams = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;

  const exams = await Exam.find(filter)
    .select('-mcqQuestions.correctOptionIndex -codingQuestions.testCases.expectedOutput')
    .sort({ createdAt: -1 })
    .populate('subjectId', 'name code')
    .lean();

  res.json({ exams });
});

export const getPublishedExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, isPublished: true })
    .populate('subjectId', 'name code')
    .lean();
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  res.json({ exam: sanitizeExamForStudent(exam) });
});

export const startAttempt = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, isPublished: true }).lean();
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  const submission = await Submission.findOneAndUpdate(
    { examId: exam._id, studentId: req.user.id },
    { $setOnInsert: { status: 'in_progress' } },
    { upsert: true, new: true }
  ).lean();

  res.status(201).json({ submission });
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const exam = await Exam.findOne({ _id: req.params.id, isPublished: true }).lean();
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  const submission = await Submission.findOne({ examId: exam._id, studentId: req.user.id });
  if (!submission) return res.status(400).json({ message: 'Attempt not started' });
  if (submission.status === 'submitted') return res.status(400).json({ message: 'Already submitted' });

  // Auto-grade MCQ now
  let score = 0;
  const mcqAnswers = req.body.mcqAnswers || [];
  for (const ans of mcqAnswers) {
    const q = exam.mcqQuestions?.[ans.questionIndex];
    if (!q) continue;
    if (q.correctOptionIndex === ans.selectedOptionIndex) score += q.marks;
  }

  submission.mcqAnswers = mcqAnswers;
  submission.codingAnswers = req.body.codingAnswers || [];
  submission.totalScore = score;
  submission.status = 'submitted';
  submission.submittedAt = new Date();

  await submission.save();

  res.json({ submission: submission.toObject() });
});

export const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({ examId: req.params.id, studentId: req.user.id })
    .populate('examId', 'title type totalMarks')
    .lean();
  if (!submission) return res.status(404).json({ message: 'Submission not found' });
  res.json({ submission });
});
