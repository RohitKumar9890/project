import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Health() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${api}/health`);
        setData(res.data);
      } catch (e) {
        setError(e?.message || 'Failed');
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white border rounded p-6">
        <h1 className="text-xl font-semibold">API Health</h1>
        {error ? (
          <p className="mt-4 text-red-600">{error}</p>
        ) : (
          <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
