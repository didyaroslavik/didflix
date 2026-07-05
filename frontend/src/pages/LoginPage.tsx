import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen df-cinema-backdrop flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md df-animate-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="text-5xl" />
          <p className="text-fog mt-3">Track every movie you've ever seen</p>
        </div>

        {/* Card */}
        <div className="df-card overflow-hidden">
          <div className="df-filmstrip px-6 pt-5">
            {Array.from({ length: 14 }).map((_, i) => <span key={i} />)}
          </div>

          <div className="p-8">
            <h2 className="text-xl font-display font-semibold text-bone mb-6">Welcome back</h2>

            {error && (
              <div className="bg-garnet-dim/30 border border-garnet/50 text-garnet-glow rounded-lg px-4 py-3 mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-fog mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="df-input w-full rounded-lg px-4 py-2.5"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-fog mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="df-input w-full rounded-lg px-4 py-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="df-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-fog text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:text-gold-soft transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
