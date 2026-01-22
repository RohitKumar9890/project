import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import api, { setAccessToken } from '../../lib/api';

export default function FacultyExams() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'mcq',
    subjectId: '',
    durationMinutes: 60,
    totalMarks: 100,
    startsAt: '',
    endsAt: '',
  });

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        api.get('/faculty/exams'),
        api.get('/faculty/subjects'),
      ]);
      setExams(examsRes.data.exams || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (e) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty/exams', formData);
      alert('Exam created successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        type: 'mcq',
        subjectId: '',
        durationMinutes: 60,
        totalMarks: 100,
        startsAt: '',
        endsAt: '',
      });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create exam');
    }
  };

  const handlePublishExam = async (examId, currentStatus) => {
    try {
      await api.patch(`/faculty/exams/${examId}`, { isPublished: !currentStatus });
      alert('Exam status updated!');
      fetchData();
    } catch (e) {
      alert('Failed to update exam');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/faculty/exams/${examId}`);
      alert('Exam deleted successfully!');
      fetchData();
    } catch (e) {
      alert('Failed to delete exam');
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card
        title="Exam Management"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Create Exam
          </Button>
        }
      >
        {exams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No exams found</p>
        ) : (
          <Table headers={['Title', 'Code', 'Type', 'Subject', 'Duration', 'Marks', 'Status', 'Actions']}>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-gray-100 text-sm font-mono font-bold text-blue-600 rounded">
                      {exam.examCode || 'N/A'}
                    </code>
                    {exam.examCode && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exam.examCode);
                          alert('Exam code copied to clipboard!');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy code"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {exam.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSubjectName(exam.subjectId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.durationMinutes} min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.totalMarks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    exam.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/faculty/exams/${exam.id}`)}
                    className="text-xs"
                  >
                    Edit/View
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handlePublishExam(exam.id, exam.isPublished)}
                    className="text-xs"
                  >
                    {exam.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Exam">
        <form onSubmit={handleCreateExam}>
          <Input
            label="Exam Title"
            type="text"
            placeholder="e.g., Midterm Exam"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Select
            label="Exam Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="quiz">Quiz</option>
            <option value="coding">Coding</option>
          </Select>
          <Select
            label="Subject"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </Select>
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
            required
            min={1}
          />
          <Input
            label="Total Marks"
            type="number"
            value={formData.totalMarks}
            onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
            required
            min={1}
          />
          <Input
            label="Starts At"
            type="datetime-local"
            value={formData.startsAt}
            onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
          />
          <Input
            label="Ends At"
            type="datetime-local"
            value={formData.endsAt}
            onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
          />
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Exam</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

