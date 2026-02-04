export default function QuestionDisplay({ question, questionNumber, totalQuestions, answer, onAnswerChange }) {
  const handleOptionSelect = (optionIndex) => {
    onAnswerChange(optionIndex);
  };

  return (
    <div className="bg-white">
      {/* Question Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
          {question.prompt}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <label
            key={index}
            className={`
              flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors
              ${answer === index 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={answer === index}
              onChange={() => handleOptionSelect(index)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className={`ml-3 text-base ${answer === index ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>

      {/* Instructions if needed */}
      {question.instructions && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> {question.instructions}
          </p>
        </div>
      )}
    </div>
  );
}
