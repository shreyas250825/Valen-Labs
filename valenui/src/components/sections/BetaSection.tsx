import { useState } from 'react';
import { BetaSectionProps } from '../../types';
import { validateEmail } from '../../utils/validation';

export function BetaSection({ onSubmit }: BetaSectionProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        <div className="relative p-12 md:p-16 border border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-purple to-transparent" />
          
          <div className="relative">
            <div className="inline-block mb-6 px-4 py-2 bg-primary-purple/10 border border-primary-purple/20 rounded-full">
              <span className="text-sm text-primary-purple font-medium">Early Access</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Beta Access Opens
              <br />
              <span className="text-gradient">March 15, 2026</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              Be among the first to experience the future of career intelligence
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-6 py-4 bg-gray-900/50 border ${
                    error ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all`}
                  aria-label="Email address"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm text-left bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm text-left bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Successfully joined beta waitlist!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full px-8 py-4 bg-primary-purple rounded-xl text-white font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-purple/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10">{loading ? 'Joining...' : 'Join Beta Waitlist'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-primary-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
