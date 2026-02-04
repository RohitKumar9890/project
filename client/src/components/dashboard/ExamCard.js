import Link from 'next/link';

export default function ExamCard({ exam, type = 'upcoming' }) {
  const getStatusBadge = () => {
    switch (type) {
      case 'upcoming':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Upcoming</span>;
      case 'ongoing':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Available</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">Completed</span>;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
            <p className="text-sm text-gray-600">{exam.subjectName}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{exam.durationMinutes} minutes</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{exam.totalQuestions || 0} questions · {exam.totalMarks} marks</span>
          </div>
          {exam.startsAt && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(exam.startsAt)}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {type === 'completed' && exam.score !== undefined ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="text-lg font-bold text-blue-600">
                {exam.score}/{exam.totalMarks}
              </span>
            </div>
          ) : (
            <div></div>
          )}
          
          <Link href={type === 'completed' ? `/student/results/${exam.id}` : `/student/exams/${exam.id}`}>
            <a className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
              type === 'ongoing'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
            }`}>
              {type === 'completed' ? 'View Results' : type === 'ongoing' ? 'Start Exam' : 'View Details'}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
