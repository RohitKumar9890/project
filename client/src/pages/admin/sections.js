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

export default function AdminSections() {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    facultyId: '',
    semesterId: '',
    maxStudents: 75,
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
      const [sectionsRes, subjectsRes, usersRes, semestersRes] = await Promise.all([
        api.get('/admin/sections'),
        api.get('/admin/subjects'),
        api.get('/admin/users'),
        api.get('/admin/semesters'),
      ]);
      setSections(sectionsRes.data.sections || []);
      setSubjects(subjectsRes.data.subjects || []);
      setFaculty((usersRes.data.users || []).filter(u => u.role === 'faculty'));
      setSemesters(semestersRes.data.semesters || []);
    } catch (e) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/sections', formData);
      alert('Section created successfully!');
      setShowModal(false);
      setFormData({ name: '', subjectId: '', facultyId: '', semesterId: '', maxStudents: 75 });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/admin/sections/${sectionId}`);
      alert('Section deleted successfully!');
      fetchData();
    } catch (e) {
      alert('Failed to delete section');
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : 'Unknown';
  };

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : 'Unassigned';
  };

  const getSemesterName = (semesterId) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.name : 'Unknown';
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card
        title="Section Management"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Create Section
          </Button>
        }
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Sections</strong> allow you to divide a subject into multiple classes (e.g., Section A, Section B).
            Each section can have a different faculty member and schedule.
          </p>
        </div>

        {sections.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sections found</p>
        ) : (
          <Table headers={['Section Name', 'Subject', 'Faculty', 'Semester', 'Capacity', 'Enrolled', 'Actions']}>
            {sections.map((section) => (
              <tr key={section.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{section.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSubjectName(section.subjectId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getFacultyName(section.facultyId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSemesterName(section.semesterId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {section.maxStudents || 75}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(section.enrolledStudents || []).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteSection(section.id)}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Section">
        <form onSubmit={handleCreateSection}>
          <Input
            label="Section Name"
            type="text"
            placeholder="e.g., Section A, Morning Batch"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
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
          <Input
            label="Maximum Students"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
            required
            min={1}
            max={75}
          />
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Section</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

