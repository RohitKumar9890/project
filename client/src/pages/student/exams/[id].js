import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import api, { setAccessToken } from '../../../lib/api';
import { toast } from 'react-toastify';

export default function TakeExam() {
  const router = useRouter();
  const { id } = router.query;
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    mcqAnswers: [],
    codingAnswers: []
  });
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examStartTime, setExamStartTime] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    
    if (id) {
      fetchExamAndStartAttempt();
    }
  }, [id, router]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const fetchExamAndStartAttempt = async () => {
    try {
      // Get exam details
      const examRes = await api.get(`/student/exams/${id}`);
      setExam(examRes.data.exam);

      // Check if already submitted
      try {
        const submissionRes = await api.get(`/student/exams/${id}/submission`);
        if (submissionRes.data.submission && submissionRes.data.submission.status === 'submitted') {
          toast.info('You have already submitted this exam. Redirecting to progress page...');
          setTimeout(() => router.push('/student/progress'), 2000);
          return;
        }
      } catch (e) {
        // No existing submission, continue
      }

      // Start attempt
      const attemptRes = await api.post(`/student/exams/${id}/start`);
      setSubmission(attemptRes.data.submission);
      setExamStartTime(new Date());

      // Calculate time remaining
      if (examRes.data.exam.durationMinutes) {
        setTimeRemaining(examRes.data.exam.durationMinutes * 60);
      }

      // Initialize answers array
      const mcqCount = examRes.data.exam.mcqQuestions?.length || 0;
      const codingCount = examRes.data.exam.codingQuestions?.length || 0;
      
      setAnswers({
        mcqAnswers: Array(mcqCount).fill(null).map((_, idx) => ({
          questionIndex: idx,
          selectedOptionIndex: null
        })),
        codingAnswers: Array(codingCount).fill(null).map((_, idx) => ({
          questionIndex: idx,
          code: examRes.data.exam.codingQuestions[idx]?.starterCode || ''
        }))
      });

    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load exam');
      router.push('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleMCQAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      mcqAnswers: prev.mcqAnswers.map((ans, idx) => 
        idx === questionIndex ? { ...ans, selectedOptionIndex: optionIndex } : ans
      )
    }));
  };

  const handleCodingAnswer = (questionIndex, code) => {
    setAnswers(prev => ({
      ...prev,
      codingAnswers: prev.codingAnswers.map((ans, idx) => 
        idx === questionIndex ? { ...ans, code } : ans
      )
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirmed = confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.');
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      await api.post(`/student/exams/${id}/submit`, answers);
      toast.success('Exam submitted successfully!');
      router.push('/student/progress');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return 'text-gray-600';
    if (timeRemaining < 300) return 'text-red-600'; // Less than 5 minutes
    if (timeRemaining < 600) return 'text-yellow-600'; // Less than 10 minutes
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading exam...</div>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout>
        <Card title="Error">
          <p className="text-red-600">Exam not found</p>
        </Card>
      </Layout>
    );
  }

  const totalQuestions = (exam.mcqQuestions?.length || 0) + (exam.codingQuestions?.length || 0);
  const currentQuestion = currentQuestionIndex < (exam.mcqQuestions?.length || 0)
    ? exam.mcqQuestions[currentQuestionIndex]
    : exam.codingQuestions[currentQuestionIndex - (exam.mcqQuestions?.length || 0)];
  
  const isMCQ = currentQuestionIndex < (exam.mcqQuestions?.length || 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Exam Header */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            {timeRemaining !== null && (
              <div className={`text-3xl font-bold ${getTimerColor()}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          <div className="mb-4 bg-gray-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </Card>

        {/* Question Display */}
        <Card className="mt-4">
          <div className="mb-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isMCQ ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {isMCQ ? 'Multiple Choice' : 'Coding Question'}
            </span>
            {currentQuestion?.marks && (
              <span className="ml-2 text-sm text-gray-600">
                ({currentQuestion.marks} marks)
              </span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion?.prompt || 'Question not available'}
            </h3>

            {isMCQ ? (
              // MCQ Options
              <div className="space-y-3">
                {currentQuestion?.options?.map((option, idx) => {
                  const mcqIndex = currentQuestionIndex;
                  const isSelected = answers.mcqAnswers[mcqIndex]?.selectedOptionIndex === idx;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleMCQAnswer(mcqIndex, idx)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                        }`}>
                          {isSelected && <span className="text-white text-sm">✓</span>}
                        </div>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Coding Question
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Language:</strong> {currentQuestion?.language || 'JavaScript'}
                  </p>
                  {currentQuestion?.testCases?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Sample Test Cases:</p>
                      {currentQuestion.testCases.map((tc, idx) => (
                        <div key={idx} className="text-xs text-gray-600 mb-1">
                          <span className="font-mono">Input: {tc.input}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-600"
                  value={answers.codingAnswers[currentQuestionIndex - (exam.mcqQuestions?.length || 0)]?.code || ''}
                  onChange={(e) => handleCodingAnswer(
                    currentQuestionIndex - (exam.mcqQuestions?.length || 0),
                    e.target.value
                  )}
                  placeholder="Write your code here..."
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </Button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            )}
          </div>
        </Card>

        {/* Question Navigator */}
        <Card className="mt-4" title="Question Navigator">
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isMCQQuestion = idx < (exam.mcqQuestions?.length || 0);
              const isAnswered = isMCQQuestion
                ? answers.mcqAnswers[idx]?.selectedOptionIndex !== null
                : answers.codingAnswers[idx - (exam.mcqQuestions?.length || 0)]?.code?.trim() !== '';
              
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 border-2 border-green-600'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
