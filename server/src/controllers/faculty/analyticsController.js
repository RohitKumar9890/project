import { asyncHandler } from '../../utils/asyncHandler.js';
import { Exam } from '../../models/Exam.js';
import { Submission } from '../../models/Submission.js';
import { Subject } from '../../models/Subject.js';
import { generateExamAnalytics } from '../../utils/examSecurity.js';

/**
 * Get detailed analytics for a specific exam
 * @route GET /api/faculty/analytics/exam/:examId
 */
export const getExamAnalytics = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  
  // Verify ownership
  if (exam.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Get all submissions for this exam
  const submissions = await Submission.find({ examId: req.params.examId });
  
  // Generate analytics
  const analytics = generateExamAnalytics(exam, submissions);
  
  // Calculate additional metrics
  const totalStudents = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const inProgressCount = submissions.filter(s => s.status === 'in_progress').length;
  
  // Score distribution
  const scores = submissions
    .filter(s => s.status === 'submitted')
    .map(s => s.score || 0);
  
  const scoreRanges = {
    '0-25%': 0,
    '26-50%': 0,
    '51-75%': 0,
    '76-100%': 0
  };
  
  scores.forEach(score => {
    const percentage = (score / exam.totalMarks) * 100;
    if (percentage <= 25) scoreRanges['0-25%']++;
    else if (percentage <= 50) scoreRanges['26-50%']++;
    else if (percentage <= 75) scoreRanges['51-75%']++;
    else scoreRanges['76-100%']++;
  });
  
  // Pass/fail rate (assuming 40% is passing)
  const passingScore = exam.passingMarks || (exam.totalMarks * 0.4);
  const passedCount = scores.filter(s => s >= passingScore).length;
  const failedCount = scores.length - passedCount;
  
  // Time analytics
  const submissionTimes = submissions
    .filter(s => s.submittedAt && s.createdAt)
    .map(s => {
      const start = s.createdAt?.toDate?.() || new Date(s.createdAt);
      const end = s.submittedAt?.toDate?.() || new Date(s.submittedAt);
      return Math.floor((end - start) / 60000); // Minutes
    });
  
  const avgCompletionTime = submissionTimes.length > 0
    ? submissionTimes.reduce((sum, t) => sum + t, 0) / submissionTimes.length
    : 0;
  
  const fastestTime = submissionTimes.length > 0 ? Math.min(...submissionTimes) : 0;
  const slowestTime = submissionTimes.length > 0 ? Math.max(...submissionTimes) : 0;
  
  res.json({
    examInfo: {
      id: exam._id || exam.id,
      title: exam.title,
      type: exam.type,
      totalMarks: exam.totalMarks,
      durationMinutes: exam.durationMinutes,
      totalQuestions: (exam.mcqQuestions?.length || 0) + (exam.codingQuestions?.length || 0)
    },
    participation: {
      totalStudents,
      submittedCount,
      inProgressCount,
      submissionRate: totalStudents > 0 ? ((submittedCount / totalStudents) * 100).toFixed(1) : 0
    },
    performance: {
      averageScore: analytics.averageScore,
      medianScore: analytics.medianScore,
      highestScore: analytics.highestScore,
      lowestScore: analytics.lowestScore,
      scoreDistribution: scoreRanges,
      passRate: submittedCount > 0 ? ((passedCount / submittedCount) * 100).toFixed(1) : 0,
      passed: passedCount,
      failed: failedCount
    },
    timing: {
      averageCompletionMinutes: Math.round(avgCompletionTime),
      fastestCompletionMinutes: fastestTime,
      slowestCompletionMinutes: slowestTime
    },
    questionAnalytics: analytics.questionAnalytics,
    totalSubmissions: analytics.totalSubmissions
  });
});

/**
 * Get subject-level analytics
 * @route GET /api/faculty/analytics/subject/:subjectId
 */
export const getSubjectAnalytics = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  // Verify ownership
  if (subject.facultyId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Get all exams for this subject
  const exams = await Exam.find({ 
    subjectId: req.params.subjectId,
    createdBy: req.user.id 
  });
  
  // Get all submissions for these exams
  const examIds = exams.map(e => e._id || e.id);
  const allSubmissions = await Submission.find({});
  const submissions = allSubmissions.filter(s => examIds.includes(s.examId));
  
  // Overall statistics
  const totalExams = exams.length;
  const publishedExams = exams.filter(e => e.isPublished).length;
  const totalSubmissions = submissions.length;
  const completedSubmissions = submissions.filter(s => s.status === 'submitted').length;
  
  // Average scores across all exams
  const allScores = submissions
    .filter(s => s.status === 'submitted' && s.score !== undefined)
    .map(s => ({
      score: s.score,
      maxScore: s.maxScore || 100
    }));
  
  const avgPercentage = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + (s.score / s.maxScore * 100), 0) / allScores.length
    : 0;
  
  // Exam-by-exam breakdown
  const examBreakdown = exams.map(exam => {
    const examSubmissions = submissions.filter(s => s.examId === (exam._id || exam.id));
    const completedCount = examSubmissions.filter(s => s.status === 'submitted').length;
    const scores = examSubmissions
      .filter(s => s.status === 'submitted')
      .map(s => s.score || 0);
    
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
    
    return {
      examId: exam._id || exam.id,
      title: exam.title,
      type: exam.type,
      totalMarks: exam.totalMarks,
      isPublished: exam.isPublished,
      totalSubmissions: examSubmissions.length,
      completedSubmissions: completedCount,
      averageScore: avgScore.toFixed(2),
      createdAt: exam.createdAt
    };
  });
  
  // Sort by created date
  examBreakdown.sort((a, b) => {
    const dateA = a.createdAt?._seconds || a.createdAt?.seconds || 0;
    const dateB = b.createdAt?._seconds || b.createdAt?.seconds || 0;
    return dateB - dateA;
  });
  
  res.json({
    subjectInfo: {
      id: subject._id || subject.id,
      name: subject.name,
      code: subject.code
    },
    overview: {
      totalExams,
      publishedExams,
      totalSubmissions,
      completedSubmissions,
      averagePerformancePercentage: avgPercentage.toFixed(1)
    },
    examBreakdown
  });
});

/**
 * Get dashboard overview for faculty
 * @route GET /api/faculty/analytics/dashboard
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  
  // Get all subjects taught by faculty
  const subjects = await Subject.find({ facultyId });
  
  // Get all exams created by faculty
  const exams = await Exam.find({ createdBy: facultyId });
  
  // Get all submissions
  const examIds = exams.map(e => e._id || e.id);
  const allSubmissions = await Submission.find({});
  const submissions = allSubmissions.filter(s => examIds.includes(s.examId));
  
  // Statistics
  const totalSubjects = subjects.length;
  const totalExams = exams.length;
  const publishedExams = exams.filter(e => e.isPublished).length;
  const draftExams = totalExams - publishedExams;
  
  const totalSubmissions = submissions.length;
  const pendingGrading = submissions.filter(s => 
    s.status === 'submitted' && 
    exams.find(e => (e._id || e.id) === s.examId)?.type === 'coding'
  ).length;
  
  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSubmissions = submissions.filter(s => {
    const submittedAt = s.submittedAt?.toDate?.() || new Date(s.submittedAt);
    return submittedAt > sevenDaysAgo;
  });
  
  // Top performing exams
  const examPerformance = exams
    .filter(e => e.isPublished)
    .map(exam => {
      const examSubs = submissions.filter(s => s.examId === (exam._id || exam.id));
      const completed = examSubs.filter(s => s.status === 'submitted');
      const avgScore = completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length
        : 0;
      
      return {
        examId: exam._id || exam.id,
        title: exam.title,
        submissionCount: completed.length,
        averageScore: avgScore,
        totalMarks: exam.totalMarks
      };
    })
    .sort((a, b) => b.submissionCount - a.submissionCount)
    .slice(0, 5);
  
  res.json({
    overview: {
      totalSubjects,
      totalExams,
      publishedExams,
      draftExams,
      totalSubmissions,
      pendingGrading
    },
    recentActivity: {
      submissionsLast7Days: recentSubmissions.length
    },
    topPerformingExams: examPerformance
  });
});

/**
 * Get student performance comparison
 * @route GET /api/faculty/analytics/exam/:examId/students
 */
export const getStudentComparison = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  
  if (exam.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Get all submissions
  const submissions = await Submission.find({ examId: req.params.examId });
  
  // Get student details
  const { User } = await import('../../models/User.js');
  const studentIds = [...new Set(submissions.map(s => s.studentId))];
  const students = await Promise.all(
    studentIds.map(id => User.findById(id))
  );
  
  // Create student performance map
  const studentPerformance = submissions
    .filter(s => s.status === 'submitted')
    .map(sub => {
      const student = students.find(st => (st?._id || st?.id) === sub.studentId);
      
      return {
        studentId: sub.studentId,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || 'Unknown',
        score: sub.score || 0,
        maxScore: sub.maxScore || exam.totalMarks,
        percentage: ((sub.score || 0) / (sub.maxScore || exam.totalMarks) * 100).toFixed(1),
        submittedAt: sub.submittedAt,
        timeTaken: calculateTimeTaken(sub)
      };
    })
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  res.json({
    examTitle: exam.title,
    totalMarks: exam.totalMarks,
    students: studentPerformance
  });
});

// Helper function
function calculateTimeTaken(submission) {
  if (!submission.submittedAt || !submission.createdAt) return null;
  
  const start = submission.createdAt?.toDate?.() || new Date(submission.createdAt);
  const end = submission.submittedAt?.toDate?.() || new Date(submission.submittedAt);
  const minutes = Math.floor((end - start) / 60000);
  
  return minutes;
}
