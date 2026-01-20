import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import api, { setAccessToken } from '../../lib/api';

export default function FacultyAnnouncements() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    priority: 'normal',
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
      const [announcementsRes, subjectsRes] = await Promise.all([
        api.get('/faculty/announcements'),
        api.get('/faculty/subjects'),
      ]);
      setAnnouncements(announcementsRes.data.announcements || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (e) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty/announcements', formData);
      alert('Announcement created successfully!');
      setShowModal(false);
      setFormData({ title: '', content: '', subjectId: '', priority: 'normal' });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/faculty/announcements/${announcementId}`);
      alert('Announcement deleted successfully!');
      fetchData();
    } catch (e) {
      alert('Failed to delete announcement');
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <Card
        title="Announcements"
        actions={
          <Button onClick={() => setShowModal(true)}>
            + Create Announcement
          </Button>
        }
      >
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No announcements found</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Subject: {getSubjectName(announcement.subjectId)}</span>
                      <span>
                        {announcement.createdAt 
                          ? new Date(announcement.createdAt.seconds * 1000).toLocaleDateString()
                          : 'Just now'
                        }
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-xs ml-4"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Announcement">
        <form onSubmit={handleCreateAnnouncement}>
          <Input
            label="Title"
            type="text"
            placeholder="e.g., Important: Exam Postponed"
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
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Write your announcement here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Announcement</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

