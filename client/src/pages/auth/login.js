import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useState } from 'react';
import api, { setAccessToken } from '../../lib/api';
import Logo from '../../components/Logo';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values) => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const res = await api.post('/auth/login', values);
      const { accessToken, refreshToken, user } = res.data;
      
      // Use sessionStorage instead of localStorage for auto-logout on close
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userRole', user.role);
      
      setAccessToken(accessToken);
      
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/users');
      } else if (user.role === 'faculty') {
        router.push('/faculty/exams');
      } else if (user.role === 'student') {
        router.push('/student/exams');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      setLoading(false);
      
      // Provide detailed error messages
      if (!e.response) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else if (e.response.status === 429) {
        setErrorMessage('Too many login attempts. Please wait a moment and try again.');
      } else if (e.response.status === 401) {
        setErrorMessage('Invalid email or password. Please try again.');
      } else if (e.response.data?.message) {
        setErrorMessage(e.response.data.message);
      } else {
        setErrorMessage('Login failed. Please try again later.');
      }
      
      console.error('Login error:', e);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="xl" showText={true} />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Sign in to access your account
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Test Accounts Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-semibold text-blue-900 mb-2">📋 Test Accounts:</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li><strong>Admin:</strong> rk8766323@gmail.com</li>
            <li><strong>Faculty:</strong> faculty@test.com</li>
            <li><strong>Student:</strong> student@test.com</li>
          </ul>
          <p className="text-blue-600 mt-2 text-xs">See TEST_ACCOUNTS.md for passwords</p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="email"
              disabled={loading}
              {...register('email', { required: true })}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">Email is required</span>
            )}
          </label>

          <label className="block mt-4">
            <span className="text-sm text-gray-700">Password</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="password"
              disabled={loading}
              {...register('password', { required: true })}
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">Password is required</span>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
