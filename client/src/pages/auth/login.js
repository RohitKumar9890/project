import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useState } from 'react';
import api, { setAccessToken } from '../../lib/api';
import Logo from '../../components/Logo';
import { signInWithGoogle, signInWithMicrosoft } from '../../lib/firebase';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  const handleOAuthLogin = async (provider, signInFunction) => {
    setOauthLoading(true);
    setErrorMessage('');
    
    try {
      // Step 1: Sign in with Firebase OAuth
      const { idToken, user: oauthUser } = await signInFunction();
      
      // Step 2: Send token to backend for verification and user creation
      const res = await api.post('/auth/oauth/login', {
        idToken,
        provider: oauthUser.provider,
      });
      
      const { accessToken, refreshToken, user } = res.data;
      
      // Store tokens
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
      setOauthLoading(false);
      
      // Handle OAuth-specific errors
      if (e.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else if (e.code === 'auth/popup-blocked') {
        setErrorMessage('Popup blocked. Please allow popups for this site.');
      } else if (e.code === 'auth/cancelled-popup-request') {
        // User opened another popup, ignore this error
        return;
      } else if (!e.response) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else if (e.response?.data?.message) {
        setErrorMessage(e.response.data.message);
      } else {
        setErrorMessage(`${provider} sign-in failed. Please try again.`);
      }
      
      console.error(`${provider} login error:`, e);
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('Google', signInWithGoogle);
  const handleMicrosoftLogin = () => handleOAuthLogin('Microsoft', signInWithMicrosoft);

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

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading || oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M0 0h11v11H0z" />
              <path fill="#81bc06" d="M12 0h11v11H12z" />
              <path fill="#05a6f0" d="M0 12h11v11H0z" />
              <path fill="#ffba08" d="M12 12h11v11H12z" />
            </svg>
            <span className="font-medium">Continue with Microsoft</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="email"
              disabled={loading || oauthLoading}
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
              disabled={loading || oauthLoading}
              {...register('password', { required: true })}
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">Password is required</span>
            )}
          </label>

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="mt-6 w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
