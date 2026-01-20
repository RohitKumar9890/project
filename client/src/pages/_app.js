import '../styles/globals.css';
import { useEffect } from 'react';
import { setAccessToken } from '../lib/api';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    if (token) setAccessToken(token);
  }, []);

  return <Component {...pageProps} />;
}

