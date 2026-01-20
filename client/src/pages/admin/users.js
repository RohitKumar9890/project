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

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      alert('User created successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentStatus });
      alert('User status updated!');
      fetchUsers();
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Administrators</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {users.filter(u => u.role === 'faculty').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Faculty Members</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Students</div>
            </div>
          </Card>
        </div>

        {/* Administrators */}
        <Card
          title="👨‍💼 Administrators"
          actions={
            <Button onClick={() => { setFormData({ ...formData, role: 'admin' }); setShowModal(true); }}>
              + Add Admin
            </Button>
          }
        >
          {error && <p className="text-red-600 mb-4">{error}</p>}
          
          {users.filter(u => u.role === 'admin').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No administrators</p>
          ) : (
            <Table headers={['Name', 'Email', 'Status', 'Actions']}>
              {users.filter(u => u.role === 'admin').map((user) => (
                <tr key={user.id} className="bg-purple-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="text-xs"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
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

        {/* Faculty */}
        <Card
          title="👨‍🏫 Faculty Members"
          actions={
            <Button onClick={() => { setFormData({ ...formData, role: 'faculty' }); setShowModal(true); }}>
              + Add Faculty
            </Button>
          }
        >
          {users.filter(u => u.role === 'faculty').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No faculty members</p>
          ) : (
            <Table headers={['Name', 'Email', 'Status', 'Actions']}>
              {users.filter(u => u.role === 'faculty').map((user) => (
                <tr key={user.id} className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="text-xs"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
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

        {/* Students */}
        <Card
          title="🎓 Students"
          actions={
            <Button onClick={() => { setFormData({ ...formData, role: 'student' }); setShowModal(true); }}>
              + Add Student
            </Button>
          }
        >
          {users.filter(u => u.role === 'student').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No students</p>
          ) : (
            <Table headers={['Name', 'Email', 'Status', 'Actions']}>
              {users.filter(u => u.role === 'student').map((user) => (
                <tr key={user.id} className="bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="text-xs"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
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
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser}>
          <Input
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create User</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

