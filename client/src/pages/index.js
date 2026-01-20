import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to EduEval</h1>
          <p className="text-xl text-gray-600">
            A comprehensive educational evaluation platform with role-based access control
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card title="For Admins">
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Manage users and permissions</li>
              <li>• Create semesters and subjects</li>
              <li>• Oversee the entire platform</li>
            </ul>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Admin Login
            </Button>
          </Card>

          <Card title="For Faculty">
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Create and manage exams</li>
              <li>• Upload course materials</li>
              <li>• Post announcements</li>
            </ul>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Faculty Login
            </Button>
          </Card>

          <Card title="For Students">
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Take exams and quizzes</li>
              <li>• Track your progress</li>
              <li>• Access course materials</li>
            </ul>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Student Login
            </Button>
          </Card>
        </div>

        <Card title="Features">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📝 Multiple Exam Types</h3>
              <p className="text-gray-600">Support for MCQ, Quiz, and Coding exams</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔐 Secure Authentication</h3>
              <p className="text-gray-600">JWT-based authentication with role management</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Progress Tracking</h3>
              <p className="text-gray-600">Detailed analytics and performance insights</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">☁️ Cloud-Based</h3>
              <p className="text-gray-600">Firebase Firestore for reliable data storage</p>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Don't have an account?</p>
          <Button variant="secondary" onClick={() => router.push('/auth/register')}>
            Register Now
          </Button>
        </div>
      </div>
    </Layout>
  );
}
