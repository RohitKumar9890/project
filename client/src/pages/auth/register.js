import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function Register() {
  const { register, handleSubmit, watch } = useForm({ defaultValues: { role: 'student' } });
  const role = watch('role');
  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      const res = await api.post('/auth/register', values);
      alert(`Registered as ${res.data.user.role}. Now login.`);
      router.push('/auth/login');
    } catch (e) {
      alert(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md w-full bg-white border rounded-lg p-8"
      >
        <h1 className="text-2xl font-bold">Register</h1>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Name</span>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register('name', { required: true })} />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Email</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            type="email"
            {...register('email', { required: true })}
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Password</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            type="password"
            {...register('password', { required: true, minLength: 6 })}
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Role</span>
          <select className="mt-1 w-full border rounded px-3 py-2" {...register('role')}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Selected: {role}</p>
        </label>

        <button
          type="submit"
          className="mt-6 w-full px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
        >
          Create account
        </button>
      </form>
    </main>
  );
}
