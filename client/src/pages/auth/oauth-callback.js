import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { setAccessToken } from '../../lib/api';

export default function OAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        
        // Check for errors
        const error = params.get('error');
        if (error) {
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => {
            router.push(`/auth/login?error=${error}`);
          }, 2000);
          return;
        }

        // Extract tokens and user data
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userRole = params.get('userRole');
        const userId = params.get('userId');
        const userName = params.get('userName');
        const userEmail = params.get('userEmail');
        const userAvatar = params.get('userAvatar');

        if (!accessToken || !refreshToken || !userRole) {
          setStatus('Invalid authentication data. Redirecting...');
          setTimeout(() => {
            router.push('/auth/login?error=invalid_oauth_data');
          }, 2000);
          return;
        }

        // Store tokens
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('userRole', userRole);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userEmail', userEmail);
        if (userAvatar) {
          sessionStorage.setItem('userAvatar', userAvatar);
        }

        setAccessToken(accessToken);

        setStatus('Authentication successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/admin/users');
          } else if (userRole === 'faculty') {
            router.push('/faculty/exams');
          } else if (userRole === 'student') {
            router.push('/student/exams');
          } else {
            router.push('/dashboard');
          }
        }, 1000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('An error occurred. Redirecting...');
        setTimeout(() => {
          router.push('/auth/login?error=oauth_callback_error');
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">{status}</h1>
        <p className="mt-2 text-sm text-gray-600">Please wait while we complete your sign-in...</p>
      </div>
    </main>
  );
}
