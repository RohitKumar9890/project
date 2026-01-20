import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import api, { setAccessToken } from '../../lib/api';

export default function StudentProgress() {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    fetchProgress();
  }, [router]);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/student/progress');
      setProgress(res.data.progress || null);
      setSubmissions(res.data.submissions || []);
    } catch (e) {
      console.error('Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallGrade = () => {
    if (submissions.length === 0) return 'N/A';
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const totalMax = submissions.reduce((sum, sub) => sum + (sub.maxScore || 0), 0);
    if (totalMax === 0) return 'N/A';
    const percentage = (totalScore / totalMax) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Overall Progress Card */}
        <Card title="Overall Progress">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Exams Attempted</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{submissions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
              <p className={`text-3xl font-bold mt-2 ${getGradeColor(parseFloat(calculateOverallGrade()))}`}>
                {calculateOverallGrade()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Completed Exams</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length}
              </p>
            </div>
          </div>
        </Card>

        {/* Exam Results Card */}
        <Card title="Exam Results">
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exam submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const percentage = submission.maxScore > 0 
                  ? (submission.score / submission.maxScore) * 100 
                  : 0;
                
                return (
                  <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.examTitle || 'Exam'}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Score:</span>{' '}
                            <span className={`font-bold ${getGradeColor(percentage)}`}>
                              {submission.score || 0}/{submission.maxScore || 0} ({percentage.toFixed(1)}%)
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                          </p>
                          {submission.submittedAt && (
                            <p>
                              <span className="font-medium">Submitted:</span>{' '}
                              {new Date(submission.submittedAt.seconds * 1000).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {percentage >= 90 && (
                        <div className="ml-4">
                          <span className="text-4xl">🏆</span>
                        </div>
                      )}
                      {percentage >= 80 && percentage < 90 && (
                        <div className="ml-4">
                          <span className="text-4xl">⭐</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Performance Insights */}
        <Card title="Performance Insights">
          <div className="space-y-3 text-sm">
            {submissions.length === 0 ? (
              <p className="text-gray-500">Start taking exams to see your performance insights.</p>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Exams Completed</span>
                  <span className="font-semibold text-gray-900">{submissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Highest Score</span>
                  <span className="font-semibold text-gray-900">
                    {submissions.length > 0
                      ? Math.max(...submissions.map(s => 
                          s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0
                        )).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Lowest Score</span>
                  <span className="font-semibold text-gray-900">
                    {submissions.length > 0
                      ? Math.min(...submissions.map(s => 
                          s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0
                        )).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

