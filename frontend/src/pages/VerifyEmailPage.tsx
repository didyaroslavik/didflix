import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import Logo from '../components/Logo';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(
    token ? '' : 'Invalid verification link.'
  );

  useEffect(() => {
    if (!token) return;

    client.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified!');
      })
      .catch((error: unknown) => {
        setStatus('error');
        const err = error as { response?: { data?: { error?: string } } };
        setMessage(err.response?.data?.error || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="min-h-screen df-cinema-backdrop flex items-center justify-center px-4">
      <div className="text-center df-animate-in">
        <Logo className="text-5xl mb-8" />

        {status === 'loading' && (
          <p className="text-fog text-lg">Verifying your email...</p>
        )}

        {status === 'success' && (
          <div className="df-card p-8 max-w-sm">
            <p className="text-4xl mb-4">✅</p>
            <h2 className="text-xl font-display font-semibold text-bone mb-2">
              Email verified!
            </h2>
            <p className="text-fog mb-6">{message}</p>
            <Link
              to="/login"
              className="df-btn-primary block rounded-lg px-4 py-2.5 text-center"
            >
              Sign in to DidFlix
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="df-card p-8 max-w-sm">
            <p className="text-4xl mb-4">❌</p>
            <h2 className="text-xl font-display font-semibold text-bone mb-2">
              Verification failed
            </h2>
            <p className="text-fog mb-6">{message}</p>
            <Link
              to="/register"
              className="df-btn-primary block rounded-lg px-4 py-2.5 text-center"
            >
              Try registering again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}