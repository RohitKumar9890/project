import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api, { setAccessToken } from '../lib/api';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check sessionStorage first (for session-based logout)
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (e) {
      console.error('Failed to fetch user');
    }
  };

  const handleLogout = () => {
    // Clear both sessionStorage and localStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">EduEval</h1>
              {user && (
                <div className="ml-8 flex space-x-4">
                  <a href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Dashboard
                  </a>
                  {user.role === 'admin' && (
                    <>
                      <a href="/admin/users" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Users
                      </a>
                      <a href="/admin/semesters" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Semesters
                      </a>
                      <a href="/admin/subjects" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Subjects
                      </a>
                      <a href="/admin/sections" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Sections
                      </a>
                      <a href="/admin/export" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        📥 Export
                      </a>
                    </>
                  )}
                  {user.role === 'faculty' && (
                    <>
                      <a href="/faculty/exams" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Exams
                      </a>
                      <a href="/faculty/materials" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Materials
                      </a>
                      <a href="/faculty/announcements" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Announcements
                      </a>
                    </>
                  )}
                  {user.role === 'student' && (
                    <>
                      <a href="/student/exams" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Exams
                      </a>
                      <a href="/student/progress" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        Progress
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">
                    {user.name} <span className="text-xs text-gray-500">({user.role})</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
