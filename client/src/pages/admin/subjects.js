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

export default function AdminSubjects() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semesterId: '',
    facultyId: '',
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
      const [subjectsRes, semestersRes, usersRes] = await Promise.all([
        api.get('/admin/subjects'),
        api.get('/admin/semesters'),
        api.get('/admin/users'),
      ]);
      setSubjects(subjectsRes.data.subjects || []);
      setSemesters(semestersRes.data.semesters || []);
      setFaculty((usersRes.data.users || []).filter(u => u.role === 'faculty'));
    } catch (e) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', formData);
      alert('Subject created successfully!');
      setShowModal(false);
      setFormData({ name: '', code: '', semesterId: '', facultyId: '' });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/admin/subjects/${subjectId}`);
      alert('Subject deleted successfully!');
      fetchData();
    } catch (e) {
      alert('Failed to delete subject');
    }
  };

  const getSemesterName = (semesterId) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.name : 'Unknown';
  };

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : 'Unassigned';
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card
        title="Subject Management"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Create Subject
          </Button>
        }
      >
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No subjects found</p>
        ) : (
          <Table headers={['Subject Name', 'Code', 'Semester', 'Faculty', 'Actions']}>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSemesterName(subject.semesterId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getFacultyName(subject.facultyId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteSubject(subject.id)}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Subject">
        <form onSubmit={handleCreateSubject}>
          <Input
            label="Subject Name"
            type="text"
            placeholder="e.g., Data Structures"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Subject Code"
            type="text"
            placeholder="e.g., CS301"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Select
            label="Semester"
            value={formData.semesterId}
            onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
            required
          >
            <option value="">Select Semester</option>
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </Select>
          <Select
            label="Faculty"
            value={formData.facultyId}
            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
            required
          >
            <option value="">Select Faculty</option>
            {faculty.map(facultyMember => (
              <option key={facultyMember.id} value={facultyMember.id}>
                {facultyMember.name}
              </option>
            ))}
          </Select>
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Subject</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

