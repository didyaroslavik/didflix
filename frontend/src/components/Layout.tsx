import { Link, useLocation, useNavigate } from 'react-router-dom';import { useAuth } from '../context/AuthContext';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/collection', label: 'My Collection' },
    { path: '/friends', label: 'Find Users' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-white">
                🎬 DidFlix
              </Link>
              
              <div className="flex items-center gap-4">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/u/${user?.shareToken}`;
                  navigator.clipboard.writeText(url);
                  alert('Profile link copied to clipboard!');
                }}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Share Profile
              </button>
              <span className="text-sm text-gray-400">
                {user?.displayName || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}