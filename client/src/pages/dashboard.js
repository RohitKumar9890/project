import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Card from '../components/Card';
import api, { setAccessToken } from '../lib/api';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState({ admins: [], faculty: [], students: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Check sessionStorage first (for auto-logout)
        const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        setAccessToken(token);
        
        const res = await api.get('/auth/me');
        setMe(res.data.user);
        
        // If admin, fetch all users for dashboard
        if (res.data.user.role === 'admin') {
          try {
            const usersRes = await api.get('/admin/users');
            const allUsers = usersRes.data.users || [];
            
            setUsers({
              admins: allUsers.filter(u => u.role === 'admin'),
              faculty: allUsers.filter(u => u.role === 'faculty'),
              students: allUsers.filter(u => u.role === 'student'),
            });
          } catch (e) {
            console.error('Failed to fetch users');
          }
        }
      } catch (e) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  if (!me) {
    return null;
  }

  // Role-specific dashboards
  if (me.role === 'faculty') {
    router.push('/faculty/exams');
    return (
      <Layout>
        <Card title="Dashboard">
          <div className="text-center py-8">
            <p className="text-gray-600">Redirecting to Faculty Dashboard...</p>
          </div>
        </Card>
      </Layout>
    );
  }

  if (me.role === 'student') {
    router.push('/student/exams');
    return (
      <Layout>
        <Card title="Dashboard">
          <div className="text-center py-8">
            <p className="text-gray-600">Redirecting to Student Dashboard...</p>
          </div>
        </Card>
      </Layout>
    );
  }

  // Admin Dashboard with user lists
  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card title="Admin Dashboard">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900">Welcome, {me.name}!</h2>
            <p className="text-gray-600 mt-1">Manage your educational platform from here.</p>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{users.admins.length}</div>
              <div className="text-sm text-gray-600 mt-1">Administrators</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{users.faculty.length}</div>
              <div className="text-sm text-gray-600 mt-1">Faculty Members</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{users.students.length}</div>
              <div className="text-sm text-gray-600 mt-1">Students</div>
            </div>
          </Card>
        </div>

        {/* Administrators List */}
        <Card title="👨‍💼 Administrators">
          {users.admins.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No administrators</p>
          ) : (
            <div className="space-y-2">
              {users.admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{admin.name}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Faculty List */}
        <Card title="👨‍🏫 Faculty Members">
          {users.faculty.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No faculty members</p>
          ) : (
            <div className="space-y-2">
              {users.faculty.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Students List */}
        <Card title="🎓 Students">
          {users.students.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No students</p>
          ) : (
            <div className="space-y-2">
              {users.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
