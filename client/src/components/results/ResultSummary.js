export default function ResultSummary({ result }) {
  const percentage = ((result.score / result.totalMarks) * 100).toFixed(1);
  const passed = result.score >= (result.passingMarks || result.totalMarks * 0.4);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
      {/* Score Display */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Score</h2>
        <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {result.score}/{result.totalMarks}
        </div>
        <div className="text-2xl text-gray-600">{percentage}%</div>
        
        {/* Pass/Fail Badge */}
        <div className="mt-4">
          {passed ? (
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Passed
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not Passed
            </span>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {result.correctAnswers || 0}
          </div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {result.incorrectAnswers || 0}
          </div>
          <div className="text-sm text-gray-600">Incorrect</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-600 mb-1">
            {result.unanswered || 0}
          </div>
          <div className="text-sm text-gray-600">Unanswered</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Time Taken</span>
          <span className="font-semibold text-gray-900">{result.timeTaken} min</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Accuracy</span>
          <span className="font-semibold text-gray-900">{result.accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
