import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api, { setAccessToken } from '../../lib/api';
import { useEffect } from 'react';

export default function JoinExam() {
  const router = useRouter();
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
  }, [router]);

  const handleJoinExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/student/join-exam', { examCode: examCode.toUpperCase() });
      alert(`Successfully joined: ${res.data.exam.title}!`);
      router.push('/student/exams');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to join exam. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card title="Join Exam">
          <p className="text-gray-600 mb-6">
            Enter the exam code provided by your instructor to join the exam.
          </p>

          <form onSubmit={handleJoinExam}>
            <Input
              label="Exam Code"
              type="text"
              placeholder="e.g., ABC123"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              className="text-center text-2xl font-mono font-bold tracking-widest"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading || examCode.length !== 6} className="flex-1">
                {loading ? 'Joining...' : 'Join Exam'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/student/exams')}
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Get the 6-character code from your instructor</li>
              <li>2. Enter the code above</li>
              <li>3. Click "Join Exam"</li>
              <li>4. The exam will appear in your exam list</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

