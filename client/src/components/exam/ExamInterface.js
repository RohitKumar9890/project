import { useState, useEffect } from 'react';
import ExamHeader from './ExamHeader';
import QuestionDisplay from './QuestionDisplay';
import QuestionPalette from './QuestionPalette';
import ExamNavigation from './ExamNavigation';
import SubmitConfirmModal from './SubmitConfirmModal';

export default function ExamInterface({ exam, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // Call auto-save API
      console.log('Auto-saving...', answers);
      // await fetch(`/api/student/exams/${exam.id}/auto-save`, {
      //   method: 'POST',
      //   body: JSON.stringify({ answers })
      // });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answers, exam.id]);

  const handleAnswerChange = (answerValue) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerValue
    }));
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      if (prev.includes(currentQuestion)) {
        return prev.filter(q => q !== currentQuestion);
      }
      return [...prev, currentQuestion];
    });
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    onSubmit(answers);
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    onSubmit(answers);
  };

  const answeredCount = Object.keys(answers).filter(
    key => answers[key] !== undefined && answers[key] !== null
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExamHeader 
        examTitle={exam.title} 
        duration={exam.durationMinutes}
        onTimeUp={handleTimeUp}
      />

      {/* Main Content */}
      <div className="pt-20 pb-24" style={{ height: '100vh' }}>
        <div className="flex h-full">
          {/* Question Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <QuestionDisplay
                question={exam.questions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                totalQuestions={exam.questions.length}
                answer={answers[currentQuestion]}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          </div>

          {/* Question Palette */}
          <div className="w-80 flex-shrink-0">
            <QuestionPalette
              questions={exam.questions}
              currentQuestion={currentQuestion}
              answers={answers}
              markedForReview={markedForReview}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ExamNavigation
        currentQuestion={currentQuestion}
        totalQuestions={exam.questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onMarkForReview={handleMarkForReview}
        isMarkedForReview={markedForReview.includes(currentQuestion)}
        onSubmit={handleSubmitClick}
      />

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        answeredCount={answeredCount}
        totalQuestions={exam.questions.length}
        markedCount={markedForReview.length}
      />
    </div>
  );
}
