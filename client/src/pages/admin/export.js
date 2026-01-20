import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api, { setAccessToken } from '../../lib/api';

export default function AdminExport() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAccessToken(token);
  }, [router]);

  const handleExportUsers = async () => {
    try {
      const response = await api.get('/admin/export/users', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Users exported successfully!');
    } catch (e) {
      alert('Failed to export users');
    }
  };

  const handleExportAllSubmissions = async () => {
    try {
      const response = await api.get('/admin/export/submissions', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_submissions_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Submissions exported successfully!');
    } catch (e) {
      alert('Failed to export submissions');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/admin/export/template', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Template downloaded successfully!');
    } catch (e) {
      alert('Failed to download template');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/admin/import/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data.results);
      alert(`Import completed! ${response.data.results.successful} users created, ${response.data.results.failed} errors.`);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <Layout>
      <Card title="Export Data to Excel">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Users</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all users (Admin, Faculty, Students) with their details in Excel format.
            </p>
            <Button onClick={handleExportUsers} variant="success">
              📥 Download Users Excel
            </Button>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export All Submissions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all exam submissions with student details and scores in Excel format.
            </p>
            <Button onClick={handleExportAllSubmissions} variant="success">
              📥 Download All Submissions
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 What's Included:</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div>
                <strong>Users Excel:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>User ID, Name, Email</li>
                  <li>Role (Admin/Faculty/Student)</li>
                  <li>Status (Active/Inactive)</li>
                  <li>Created Date</li>
                </ul>
              </div>
              <div className="mt-2">
                <strong>Submissions Excel:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>Student Name & Email</li>
                  <li>Exam Title</li>
                  <li>Score, Max Score, Percentage</li>
                  <li>Status & Submission Date</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📤 Bulk Import Users from Excel</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload an Excel file with multiple users to create them all at once.
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleDownloadTemplate} variant="secondary">
                📥 Download Template Excel
              </Button>
              
              <div className="mt-3">
                <label className="block">
                  <span className="sr-only">Choose Excel file</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      disabled:opacity-50"
                  />
                </label>
                {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
              </div>
            </div>

            {uploadResult && (
              <div className="mt-4 p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Import Results:</h4>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{uploadResult.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.successful}</div>
                    <div className="text-sm text-gray-600">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {uploadResult.successDetails && uploadResult.successDetails.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-green-800 mb-1">✅ Created Users:</p>
                    <div className="max-h-32 overflow-y-auto text-xs text-gray-700 space-y-1">
                      {uploadResult.successDetails.map((user, idx) => (
                        <div key={idx}>Row {user.row}: {user.name} ({user.email})</div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">❌ Errors:</p>
                    <div className="max-h-32 overflow-y-auto text-xs text-red-700 space-y-1">
                      {uploadResult.errorDetails.map((error, idx) => (
                        <div key={idx}>Row {error.row}: {error.email} - {error.error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
              <li>Download the template first, fill it with user data</li>
              <li>Delete example rows before uploading</li>
              <li>Email must be unique, password min 6 characters</li>
              <li>Role must be: admin, faculty, or student (lowercase)</li>
              <li>Excel files can be opened in Microsoft Excel, Google Sheets, or LibreOffice</li>
            </ul>
          </div>
        </div>
      </Card>
    </Layout>
  );
}

