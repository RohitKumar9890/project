export default function QuestionReview({ questions, answers }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Question-wise Analysis</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {questions.map((question, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer?.isCorrect;
          const wasAnswered = userAnswer?.selectedOption !== undefined;

          return (
            <div key={index} className="p-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    <span className="text-sm text-gray-500">{question.marks} marks</span>
                  </div>
                  <p className="text-base text-gray-900">{question.prompt}</p>
                </div>
                
                {/* Status Badge */}
                {wasAnswered ? (
                  isCorrect ? (
                    <span className="flex-shrink-0 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Correct
                    </span>
                  ) : (
                    <span className="flex-shrink-0 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Incorrect
                    </span>
                  )
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Not Answered
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {question.options?.map((option, optionIndex) => {
                  const isUserAnswer = userAnswer?.selectedOption === optionIndex;
                  const isCorrectAnswer = question.correctOptionIndex === optionIndex;

                  let bgColor = 'bg-gray-50';
                  let borderColor = 'border-gray-200';
                  let textColor = 'text-gray-700';

                  if (isCorrectAnswer) {
                    bgColor = 'bg-green-50';
                    borderColor = 'border-green-300';
                    textColor = 'text-green-900';
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = 'bg-red-50';
                    borderColor = 'border-red-300';
                    textColor = 'text-red-900';
                  }

                  return (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded border ${bgColor} ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textColor}`}>{option}</span>
                        <div className="flex items-center space-x-2">
                          {isUserAnswer && (
                            <span className="text-xs text-gray-500">Your answer</span>
                          )}
                          {isCorrectAnswer && (
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
