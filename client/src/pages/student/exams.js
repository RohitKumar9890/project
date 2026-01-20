import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api, { setAccessToken } from '../../lib/api';

export default function StudentExams() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    fetchExams();
  }, [router]);

  const fetchExams = async () => {
    try {
      // Get only enrolled exams
      const res = await api.get('/student/my-exams');
      setExams(res.data.exams || []);
    } catch (e) {
      console.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    router.push(`/student/exams/${examId}`);
  };

  const isExamAvailable = (exam) => {
    if (!exam.startsAt || !exam.endsAt) return true;
    const now = new Date();
    const start = new Date(exam.startsAt);
    const end = new Date(exam.endsAt);
    return now >= start && now <= end;
  };

  const getExamStatus = (exam) => {
    if (!exam.startsAt || !exam.endsAt) return 'Available';
    const now = new Date();
    const start = new Date(exam.startsAt);
    const end = new Date(exam.endsAt);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Closed';
    return 'Active';
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card 
        title="My Exams"
        actions={
          <Button onClick={() => router.push('/student/join-exam')}>
            + Join Exam
          </Button>
        }
      >
        {exams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No exams available</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              const available = isExamAvailable(exam);
              
              return (
                <div key={exam.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      status === 'Active' ? 'bg-green-100 text-green-800' :
                      status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <p><span className="font-medium">Type:</span> {exam.type.toUpperCase()}</p>
                    <p><span className="font-medium">Duration:</span> {exam.durationMinutes} minutes</p>
                    <p><span className="font-medium">Total Marks:</span> {exam.totalMarks}</p>
                    {exam.startsAt && (
                      <p><span className="font-medium">Starts:</span> {new Date(exam.startsAt).toLocaleString()}</p>
                    )}
                    {exam.endsAt && (
                      <p><span className="font-medium">Ends:</span> {new Date(exam.endsAt).toLocaleString()}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleStartExam(exam.id)}
                    disabled={!available}
                    className="w-full"
                  >
                    {available ? 'Start Exam' : 'Not Available'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
}

