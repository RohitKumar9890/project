import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import api from '../lib/api';

export default function CodeRunner() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      language: 'javascript',
      code: "console.log('hello from EduEval');",
      stdin: '',
    },
  });
  const [result, setResult] = useState(null);

  const onSubmit = async (values) => {
    try {
      const res = await api.post('/code/execute', values);
      setResult(res.data.result);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Execution failed (are you logged in?)');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white border rounded p-6">
        <h1 className="text-xl font-semibold">Code Runner (MVP)</h1>
        <p className="mt-1 text-sm text-gray-600">
          Requires login as Student or Faculty. Docker must be available on the server for real execution.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Language</span>
            <select className="mt-1 w-full border rounded px-3 py-2" {...register('language')}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Code</span>
            <textarea className="mt-1 w-full border rounded px-3 py-2 font-mono" rows={10} {...register('code')} />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">stdin (optional)</span>
            <textarea className="mt-1 w-full border rounded px-3 py-2 font-mono" rows={3} {...register('stdin')} />
          </label>

          <button className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700" type="submit">
            Run
          </button>
        </form>

        <div className="mt-6">
          <h2 className="font-semibold">Result</h2>
          <pre className="mt-2 text-sm bg-gray-100 p-3 rounded overflow-auto">
            {result ? JSON.stringify(result, null, 2) : 'No result yet.'}
          </pre>
        </div>
      </div>
    </main>
  );
}
