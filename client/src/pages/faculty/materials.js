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

export default function FacultyMaterials() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    fileUrl: '',
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
      const [materialsRes, subjectsRes] = await Promise.all([
        api.get('/faculty/materials'),
        api.get('/faculty/subjects'),
      ]);
      setMaterials(materialsRes.data.materials || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (e) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty/materials', {
        ...formData,
        fileName: formData.title,
        fileSize: 0,
        fileType: 'url',
      });
      alert('Material created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', subjectId: '', fileUrl: '' });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await api.delete(`/faculty/materials/${materialId}`);
      alert('Material deleted successfully!');
      fetchData();
    } catch (e) {
      alert('Failed to delete material');
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
        title="Course Materials"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Upload Material
          </Button>
        }
      >
        {materials.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No materials found</p>
        ) : (
          <Table headers={['Title', 'Subject', 'Description', 'Link', 'Actions']}>
            {materials.map((material) => (
              <tr key={material.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSubjectName(material.subjectId)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{material.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    View
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMaterial(material.id)}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Course Material">
        <form onSubmit={handleCreateMaterial}>
          <Input
            label="Material Title"
            type="text"
            placeholder="e.g., Lecture 1 - Introduction"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Brief description of the material"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Input
            label="File URL"
            type="url"
            placeholder="https://example.com/file.pdf"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500 mb-4">
            Note: For now, provide a direct link to your file (Google Drive, Dropbox, etc.)
          </p>
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Upload Material</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

