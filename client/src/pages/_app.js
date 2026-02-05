import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { setAccessToken } from '../lib/api';
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') : null;
    if (token) setAccessToken(token);
  }, []);

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="EduEval - A comprehensive platform for educational evaluation, exam management, and student progress tracking" />
        <meta name="keywords" content="education, evaluation, exams, student management, learning platform" />
        <meta name="author" content="EduEval" />
        
        {/* Title */}
        <title>EduEval - Educational Evaluation System</title>
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#3B82F6" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduEval" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EduEval - Educational Evaluation System" />
        <meta property="og:description" content="A comprehensive platform for educational evaluation, exam management, and student progress tracking" />
        <meta property="og:image" content="/logo.svg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="EduEval - Educational Evaluation System" />
        <meta name="twitter:description" content="A comprehensive platform for educational evaluation, exam management, and student progress tracking" />
        <meta name="twitter:image" content="/logo.svg" />
      </Head>
      
      <Component {...pageProps} />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

