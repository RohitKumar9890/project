import { useEffect, useState } from 'react';

export default function ExamHeader({ examTitle, duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // Last 5 minutes

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Exam Title */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-blue-600">EduEval</div>
          <div className="h-8 w-px bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">{examTitle}</h1>
        </div>

        {/* Right: Timer */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded border ${
            isLowTime 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
