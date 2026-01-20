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

export default function AdminSemesters() {
  const router = useRouter();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    term: 'Fall',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    fetchSemesters();
  }, [router]);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/admin/semesters');
      setSemesters(res.data.semesters || []);
    } catch (e) {
      console.error('Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/semesters', formData);
      alert('Semester created successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        term: 'Fall',
        startDate: '',
        endDate: '',
      });
      fetchSemesters();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create semester');
    }
  };

  const handleToggleActive = async (semesterId, currentStatus) => {
    try {
      await api.patch(`/admin/semesters/${semesterId}`, { isActive: !currentStatus });
      alert('Semester status updated!');
      fetchSemesters();
    } catch (e) {
      alert('Failed to update semester');
    }
  };

  const handleDeleteSemester = async (semesterId) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;
    try {
      await api.delete(`/admin/semesters/${semesterId}`);
      alert('Semester deleted successfully!');
      fetchSemesters();
    } catch (e) {
      alert('Failed to delete semester');
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card
        title="Semester Management"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Create Semester
          </Button>
        }
      >
        {semesters.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No semesters found</p>
        ) : (
          <Table headers={['Name', 'Year', 'Term', 'Start Date', 'End Date', 'Status', 'Actions']}>
            {semesters.map((semester) => (
              <tr key={semester.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{semester.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{semester.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{semester.term}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    semester.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {semester.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleToggleActive(semester.id, semester.isActive)}
                    className="text-xs"
                  >
                    {semester.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteSemester(semester.id)}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Semester">
        <form onSubmit={handleCreateSemester}>
          <Input
            label="Semester Name"
            type="text"
            placeholder="e.g., Fall 2024"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
          />
          <Select
            label="Term"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </Select>
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Semester</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

