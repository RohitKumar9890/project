import crypto from 'crypto';

/**
 * Generate a stronger exam join code (12 characters instead of 6)
 */
export const generateSecureExamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXXX-XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Randomize MCQ questions and their options for each student
 */
export const randomizeExamQuestions = (exam, studentId) => {
  // Create a deterministic seed based on exam ID and student ID
  // This ensures the same student gets the same randomization every time
  const seed = crypto.createHash('sha256').update(`${exam._id || exam.id}:${studentId}`).digest('hex');
  
  // Use seed to create pseudo-random number generator
  let seedValue = parseInt(seed.substring(0, 8), 16);
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  const shuffleWithSeed = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const randomizedExam = { ...exam };
  
  // Shuffle MCQ questions
  if (randomizedExam.mcqQuestions && randomizedExam.mcqQuestions.length > 0) {
    randomizedExam.mcqQuestions = shuffleWithSeed(randomizedExam.mcqQuestions).map((q, newIndex) => {
      // Shuffle options within each question
      const originalCorrectOption = q.options[q.correctOptionIndex];
      const shuffledOptions = shuffleWithSeed(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
      
      return {
        ...q,
        originalIndex: randomizedExam.mcqQuestions.indexOf(q), // Store original index for grading
        options: shuffledOptions,
        correctOptionIndex: newCorrectIndex
      };
    });
  }
  
  // Shuffle coding questions
  if (randomizedExam.codingQuestions && randomizedExam.codingQuestions.length > 0) {
    randomizedExam.codingQuestions = shuffleWithSeed(randomizedExam.codingQuestions).map((q) => ({
      ...q,
      originalIndex: randomizedExam.codingQuestions.indexOf(q)
    }));
  }
  
  return randomizedExam;
};

/**
 * Detect suspicious exam behavior patterns
 */
export const detectSuspiciousActivity = (examAttempt) => {
  const suspiciousPatterns = [];
  
  // Check for unusually fast completion
  if (examAttempt.completionTime && examAttempt.expectedDuration) {
    const completionRatio = examAttempt.completionTime / examAttempt.expectedDuration;
    if (completionRatio < 0.2) {
      suspiciousPatterns.push({
        type: 'UNUSUALLY_FAST',
        severity: 'high',
        details: `Completed in ${Math.round(completionRatio * 100)}% of expected time`
      });
    }
  }
  
  // Check for tab switches
  if (examAttempt.tabSwitches && examAttempt.tabSwitches > 5) {
    suspiciousPatterns.push({
      type: 'EXCESSIVE_TAB_SWITCHES',
      severity: 'high',
      details: `${examAttempt.tabSwitches} tab switches detected`
    });
  }
  
  // Check for copy-paste events
  if (examAttempt.copyPasteEvents && examAttempt.copyPasteEvents > 3) {
    suspiciousPatterns.push({
      type: 'EXCESSIVE_COPY_PASTE',
      severity: 'medium',
      details: `${examAttempt.copyPasteEvents} copy-paste events detected`
    });
  }
  
  // Check for answer pattern anomalies (all same answer, etc.)
  if (examAttempt.answers && Array.isArray(examAttempt.answers)) {
    const mcqAnswers = examAttempt.answers.filter(a => a.selectedOptionIndex !== undefined);
    if (mcqAnswers.length > 5) {
      const answerCounts = {};
      mcqAnswers.forEach(a => {
        answerCounts[a.selectedOptionIndex] = (answerCounts[a.selectedOptionIndex] || 0) + 1;
      });
      
      const maxCount = Math.max(...Object.values(answerCounts));
      if (maxCount / mcqAnswers.length > 0.8) {
        suspiciousPatterns.push({
          type: 'UNIFORM_ANSWER_PATTERN',
          severity: 'medium',
          details: `${Math.round((maxCount / mcqAnswers.length) * 100)}% of answers are the same option`
        });
      }
    }
  }
  
  return suspiciousPatterns;
};

/**
 * Calculate code similarity between two submissions (simple version)
 * For production, use external services like MOSS or JPlag
 */
export const calculateCodeSimilarity = (code1, code2) => {
  if (!code1 || !code2) return 0;
  
  // Normalize code (remove whitespace, comments, etc.)
  const normalize = (code) => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase()
      .trim();
  };
  
  const normalized1 = normalize(code1);
  const normalized2 = normalize(code2);
  
  // Simple Levenshtein distance ratio
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 1;
  
  // For simplicity, use a basic similarity check
  let matches = 0;
  const minLength = Math.min(normalized1.length, normalized2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (normalized1[i] === normalized2[i]) matches++;
  }
  
  return matches / maxLength;
};

/**
 * Validate exam attempt integrity
 */
export const validateExamAttempt = (exam, submission) => {
  const errors = [];
  
  // Check if submission time is within exam window
  if (exam.startsAt) {
    const startTime = exam.startsAt?.toDate?.() || new Date(exam.startsAt);
    const submissionTime = submission.submittedAt?.toDate?.() || new Date(submission.submittedAt);
    
    if (submissionTime < startTime) {
      errors.push('Submission time is before exam start time');
    }
  }
  
  if (exam.endsAt) {
    const endTime = exam.endsAt?.toDate?.() || new Date(exam.endsAt);
    const submissionTime = submission.submittedAt?.toDate?.() || new Date(submission.submittedAt);
    
    if (submissionTime > endTime) {
      errors.push('Submission time is after exam end time');
    }
  }
  
  // Check if student is enrolled in the exam
  if (exam.enrolledStudents && !exam.enrolledStudents.includes(submission.studentId)) {
    errors.push('Student not enrolled in this exam');
  }
  
  // Validate answer count
  const expectedAnswerCount = (exam.mcqQuestions?.length || 0) + (exam.codingQuestions?.length || 0);
  const actualAnswerCount = submission.answers?.length || 0;
  
  if (actualAnswerCount > expectedAnswerCount) {
    errors.push('Submission contains more answers than questions');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate exam analytics for faculty
 */
export const generateExamAnalytics = (exam, submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      medianScore: 0,
      highestScore: 0,
      lowestScore: 0,
      questionAnalytics: []
    };
  }
  
  const scores = submissions.map(s => s.score || 0).sort((a, b) => a - b);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const medianScore = scores[Math.floor(scores.length / 2)];
  
  // Analyze each question
  const questionAnalytics = [];
  
  if (exam.mcqQuestions) {
    exam.mcqQuestions.forEach((question, index) => {
      const answersForQuestion = submissions
        .map(s => s.answers?.find(a => a.questionIndex === index))
        .filter(a => a !== undefined);
      
      const correctCount = answersForQuestion.filter(
        a => a.selectedOptionIndex === question.correctOptionIndex
      ).length;
      
      const totalCount = answersForQuestion.length;
      const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
      
      questionAnalytics.push({
        questionIndex: index,
        type: 'mcq',
        accuracy: accuracy.toFixed(2),
        totalAttempts: totalCount,
        correctAttempts: correctCount
      });
    });
  }
  
  return {
    totalSubmissions: submissions.length,
    averageScore: averageScore.toFixed(2),
    medianScore,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    questionAnalytics
  };
};
