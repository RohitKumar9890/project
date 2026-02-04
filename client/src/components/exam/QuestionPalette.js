export default function QuestionPalette({ 
  questions, 
  currentQuestion, 
  answers, 
  markedForReview, 
  onQuestionSelect 
}) {
  const getQuestionStatus = (index) => {
    if (markedForReview.includes(index)) return 'review';
    if (answers[index] !== undefined && answers[index] !== null) return 'answered';
    if (index <= currentQuestion) return 'visited';
    return 'not-visited';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'visited':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'not-visited':
        return 'bg-white text-gray-400 border-gray-200';
      default:
        return 'bg-white text-gray-400 border-gray-200';
    }
  };

  const stats = {
    answered: questions.filter((_, i) => answers[i] !== undefined && answers[i] !== null && !markedForReview.includes(i)).length,
    review: markedForReview.length,
    notAnswered: questions.filter((_, i) => answers[i] === undefined || answers[i] === null).length - markedForReview.length,
  };

  return (
    <div className="bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Question Palette</h3>
        
        {/* Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <span className="font-medium text-gray-900">{stats.answered}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-gray-600">Review</span>
            </div>
            <span className="font-medium text-gray-900">{stats.review}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
              <span className="text-gray-600">Not Answered</span>
            </div>
            <span className="font-medium text-gray-900">{stats.notAnswered}</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            const status = getQuestionStatus(index);
            const isActive = currentQuestion === index;

            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`
                  w-10 h-10 rounded border-2 text-sm font-medium transition-all
                  ${getStatusColor(status)}
                  ${isActive ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                  hover:shadow-sm
                `}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
