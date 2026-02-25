import { useState, useEffect } from 'react';

interface Signup {
  email: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

export function Admin() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    try {
      const response = await fetch('/api/beta-signup');
      const data = await response.json();
      
      if (data.success) {
        setSignups(data.signups || []);
      } else {
        setError('Failed to load signups');
      }
    } catch (err) {
      setError('Error fetching signups');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Date', 'IP', 'User Agent'],
      ...signups.map(s => [
        s.email,
        new Date(s.timestamp).toISOString(),
        s.ip || '',
        s.userAgent || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beta-signups-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Beta Signups</h1>
            <p className="text-gray-400">Total: {signups.length}</p>
          </div>
          <button
            onClick={exportCSV}
            className="px-6 py-3 bg-primary-purple rounded-lg hover:bg-primary-purple/90 transition-colors"
          >
            Export CSV
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {signups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No signups yet
                  </td>
                </tr>
              ) : (
                signups.map((signup, index) => (
                  <tr key={index} className="hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm">{signup.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(signup.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {signup.ip || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
