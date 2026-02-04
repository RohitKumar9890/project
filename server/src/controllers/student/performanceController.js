import { asyncHandler } from '../../utils/asyncHandler.js';
import { Submission } from '../../models/Submission.js';
import { Exam } from '../../models/Exam.js';
import { Subject } from '../../models/Subject.js';
import { Progress } from '../../models/Progress.js';

/**
 * Get student's exam history
 * @route GET /api/student/performance/history
 */
export const getExamHistory = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  
  // Get all submissions
  const submissions = await Submission.find({ studentId });
  
  // Get exam and subject details
  const examHistory = await Promise.all(
    submissions.map(async (sub) => {
      const exam = await Exam.findById(sub.examId);
      let subject = null;
      
      if (exam?.subjectId) {
        subject = await Subject.findById(exam.subjectId);
      }
      
      return {
        submissionId: sub._id || sub.id,
        examId: sub.examId,
        examTitle: exam?.title || 'Unknown',
        examType: exam?.type || 'unknown',
        subjectName: subject?.name || 'Unknown',
        subjectCode: subject?.code || 'N/A',
        score: sub.score || 0,
        maxScore: sub.maxScore || exam?.totalMarks || 0,
        percentage: sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : 0,
        status: sub.status,
        submittedAt: sub.submittedAt,
        createdAt: sub.createdAt,
        isPassed: sub.score >= (exam?.passingMarks || (sub.maxScore * 0.4))
      };
    })
  );
  
  // Sort by submission date (newest first)
  examHistory.sort((a, b) => {
    const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt) || new Date(0);
    const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt) || new Date(0);
    return dateB - dateA;
  });
  
  res.json({
    history: examHistory,
    total: examHistory.length
  });
});

/**
 * Get detailed performance analytics for student
 * @route GET /api/student/performance/analytics
 */
export const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  
  // Get all completed submissions
  const submissions = await Submission.find({ 
    studentId,
    status: 'submitted'
  });
  
  // Get all exams
  const examIds = submissions.map(s => s.examId);
  const exams = await Promise.all(
    examIds.map(id => Exam.findById(id))
  );
  
  // Calculate overall statistics
  const totalExams = submissions.length;
  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMaxScore = submissions.reduce((sum, s) => sum + (s.maxScore || 0), 0);
  const overallPercentage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 0;
  
  // Calculate pass/fail
  const passedExams = submissions.filter((sub, idx) => {
    const exam = exams[idx];
    const passingScore = exam?.passingMarks || (sub.maxScore * 0.4);
    return sub.score >= passingScore;
  }).length;
  
  const failedExams = totalExams - passedExams;
  
  // Performance by subject
  const subjectMap = new Map();
  
  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    const exam = exams[i];
    
    if (exam?.subjectId) {
      const subject = await Subject.findById(exam.subjectId);
      const subjectId = exam.subjectId;
      
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName: subject?.name || 'Unknown',
          subjectCode: subject?.code || 'N/A',
          totalExams: 0,
          totalScore: 0,
          totalMaxScore: 0,
          passed: 0,
          failed: 0
        });
      }
      
      const subData = subjectMap.get(subjectId);
      subData.totalExams++;
      subData.totalScore += sub.score || 0;
      subData.totalMaxScore += sub.maxScore || 0;
      
      const passingScore = exam.passingMarks || (sub.maxScore * 0.4);
      if (sub.score >= passingScore) {
        subData.passed++;
      } else {
        subData.failed++;
      }
    }
  }
  
  const subjectPerformance = Array.from(subjectMap.values()).map(sub => ({
    ...sub,
    averagePercentage: sub.totalMaxScore > 0 
      ? ((sub.totalScore / sub.totalMaxScore) * 100).toFixed(1)
      : 0
  }));
  
  // Performance by exam type
  const typeMap = new Map();
  
  submissions.forEach((sub, idx) => {
    const exam = exams[idx];
    const type = exam?.type || 'unknown';
    
    if (!typeMap.has(type)) {
      typeMap.set(type, {
        type,
        count: 0,
        totalScore: 0,
        totalMaxScore: 0
      });
    }
    
    const typeData = typeMap.get(type);
    typeData.count++;
    typeData.totalScore += sub.score || 0;
    typeData.totalMaxScore += sub.maxScore || 0;
  });
  
  const performanceByType = Array.from(typeMap.values()).map(t => ({
    ...t,
    averagePercentage: t.totalMaxScore > 0
      ? ((t.totalScore / t.totalMaxScore) * 100).toFixed(1)
      : 0
  }));
  
  // Recent performance trend (last 10 exams)
  const recentSubmissions = submissions
    .sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
      const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
      return dateA - dateB; // Ascending order
    })
    .slice(-10);
  
  const performanceTrend = recentSubmissions.map((sub, idx) => {
    const exam = exams.find(e => (e?._id || e?.id) === sub.examId);
    return {
      examNumber: idx + 1,
      examTitle: exam?.title || 'Unknown',
      percentage: sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : 0,
      submittedAt: sub.submittedAt
    };
  });
  
  // Strengths and weaknesses (based on subject performance)
  const sortedSubjects = [...subjectPerformance].sort((a, b) => 
    parseFloat(b.averagePercentage) - parseFloat(a.averagePercentage)
  );
  
  const strengths = sortedSubjects.slice(0, 3).map(s => ({
    subject: s.subjectName,
    percentage: s.averagePercentage
  }));
  
  const weaknesses = sortedSubjects.slice(-3).reverse().map(s => ({
    subject: s.subjectName,
    percentage: s.averagePercentage
  }));
  
  res.json({
    overall: {
      totalExams,
      passedExams,
      failedExams,
      overallPercentage,
      passRate: totalExams > 0 ? ((passedExams / totalExams) * 100).toFixed(1) : 0
    },
    subjectPerformance,
    performanceByType,
    performanceTrend,
    insights: {
      strengths: strengths.filter(s => parseFloat(s.percentage) > 0),
      weaknesses: weaknesses.filter(w => parseFloat(w.percentage) > 0)
    }
  });
});

/**
 * Get performance for a specific subject
 * @route GET /api/student/performance/subject/:subjectId
 */
export const getSubjectPerformance = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { subjectId } = req.params;
  
  // Get subject info
  const subject = await Subject.findById(subjectId);
  
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  // Get all exams for this subject
  const exams = await Exam.find({ subjectId });
  const examIds = exams.map(e => e._id || e.id);
  
  // Get student's submissions for these exams
  const allSubmissions = await Submission.find({ studentId });
  const submissions = allSubmissions.filter(s => examIds.includes(s.examId));
  
  // Calculate statistics
  const completedCount = submissions.filter(s => s.status === 'submitted').length;
  const inProgressCount = submissions.filter(s => s.status === 'in_progress').length;
  
  const totalScore = submissions
    .filter(s => s.status === 'submitted')
    .reduce((sum, s) => sum + (s.score || 0), 0);
  
  const totalMaxScore = submissions
    .filter(s => s.status === 'submitted')
    .reduce((sum, s) => sum + (s.maxScore || 0), 0);
  
  const averagePercentage = totalMaxScore > 0
    ? ((totalScore / totalMaxScore) * 100).toFixed(1)
    : 0;
  
  // Exam details
  const examDetails = await Promise.all(
    submissions.map(async (sub) => {
      const exam = exams.find(e => (e._id || e.id) === sub.examId);
      
      return {
        examId: sub.examId,
        examTitle: exam?.title || 'Unknown',
        examType: exam?.type || 'unknown',
        score: sub.score || 0,
        maxScore: sub.maxScore || 0,
        percentage: sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : 0,
        status: sub.status,
        submittedAt: sub.submittedAt
      };
    })
  );
  
  // Sort by submission date
  examDetails.sort((a, b) => {
    const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
    const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
    return dateB - dateA;
  });
  
  res.json({
    subject: {
      id: subject._id || subject.id,
      name: subject.name,
      code: subject.code
    },
    summary: {
      totalExams: exams.length,
      completedExams: completedCount,
      inProgressExams: inProgressCount,
      averagePercentage
    },
    examDetails
  });
});

/**
 * Get performance dashboard for student
 * @route GET /api/student/performance/dashboard
 */
export const getPerformanceDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  
  // Get all submissions
  const allSubmissions = await Submission.find({ studentId });
  const completedSubmissions = allSubmissions.filter(s => s.status === 'submitted');
  
  // Recent exams (last 5)
  const recentSubmissions = [...completedSubmissions]
    .sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
      const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  const recentExams = await Promise.all(
    recentSubmissions.map(async (sub) => {
      const exam = await Exam.findById(sub.examId);
      const subject = exam?.subjectId ? await Subject.findById(exam.subjectId) : null;
      
      return {
        examId: sub.examId,
        examTitle: exam?.title || 'Unknown',
        subjectName: subject?.name || 'Unknown',
        score: sub.score,
        maxScore: sub.maxScore,
        percentage: sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : 0,
        submittedAt: sub.submittedAt
      };
    })
  );
  
  // Upcoming exams (published but not taken)
  const publishedExams = await Exam.find({ isPublished: true });
  const takenExamIds = allSubmissions.map(s => s.examId);
  const upcomingExams = publishedExams
    .filter(e => !takenExamIds.includes(e._id || e.id))
    .slice(0, 5)
    .map(exam => ({
      examId: exam._id || exam.id,
      title: exam.title,
      type: exam.type,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      startsAt: exam.startsAt,
      endsAt: exam.endsAt
    }));
  
  // Quick stats
  const totalCompleted = completedSubmissions.length;
  const inProgress = allSubmissions.filter(s => s.status === 'in_progress').length;
  
  const totalScore = completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMaxScore = completedSubmissions.reduce((sum, s) => sum + (s.maxScore || 0), 0);
  const overallAverage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 0;
  
  res.json({
    quickStats: {
      examsCompleted: totalCompleted,
      examsInProgress: inProgress,
      overallAverage
    },
    recentExams,
    upcomingExams
  });
});
