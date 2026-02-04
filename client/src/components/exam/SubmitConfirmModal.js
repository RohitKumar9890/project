export default function SubmitConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  answeredCount, 
  totalQuestions,
  markedCount 
}) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Submit Exam?</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to submit your exam? This action cannot be undone.
          </p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium text-gray-900">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Answered:</span>
              <span className="font-medium text-green-600">{answeredCount}</span>
            </div>
            {markedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Marked for Review:</span>
                <span className="font-medium text-yellow-600">{markedCount}</span>
              </div>
            )}
            {unansweredCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Not Answered:</span>
                <span className="font-medium text-red-600">{unansweredCount}</span>
              </div>
            )}
          </div>

          {unansweredCount > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                ⚠️ You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. 
                Are you sure you want to submit?
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}
