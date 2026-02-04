export default function ExamNavigation({ 
  currentQuestion, 
  totalQuestions, 
  onPrevious, 
  onNext, 
  onMarkForReview,
  isMarkedForReview,
  onSubmit,
  canSubmit
}) {
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === totalQuestions - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Previous */}
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`
              px-6 py-2.5 rounded border font-medium transition-colors
              ${isFirst 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            ← Previous
          </button>

          {/* Center: Mark for Review */}
          <button
            onClick={onMarkForReview}
            className={`
              px-6 py-2.5 rounded border font-medium transition-colors
              ${isMarkedForReview
                ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {isMarkedForReview ? '★ Marked' : '☆ Mark for Review'}
          </button>

          {/* Right: Next or Submit */}
          {isLast ? (
            <button
              onClick={onSubmit}
              className="px-8 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
