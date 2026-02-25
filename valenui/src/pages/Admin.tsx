import { useState, useEffect } from 'react';

interface Signup {
  email: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchSignups();
    } else {
      setLoading(false);
    }
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'sah180625') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      fetchSignups();
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setSignups([]);
    setUsername('');
    setPassword('');
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

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-primary-purple focus:outline-none"
                placeholder="Enter username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-primary-purple focus:outline-none"
                placeholder="Enter password"
              />
            </div>
            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-purple rounded-lg hover:bg-primary-purple/90 transition-colors text-white font-semibold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Beta Signups</h1>
            <p className="text-gray-400">Total: {signups.length}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-primary-purple rounded-lg hover:bg-primary-purple/90 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
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
