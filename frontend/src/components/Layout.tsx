import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/collection', label: 'My Collection' },
  { path: '/friends', label: 'Find Users' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const { i18n } = useTranslation();

  const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'ua', label: 'UA' },
    { code: 'pl', label: 'PL' }
  ];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('didflix-lang', code);
  };
  
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/u/${user?.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const initial = (user?.displayName || user?.username || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-abyss">
      <nav className="sticky top-0 z-40 bg-stage/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-10">
              <Link to="/dashboard" className="flex items-center gap-1">
                <Logo className="text-2xl" />
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(link => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                        active ? 'text-bone' : 'text-fog hover:text-bone'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-garnet-bright" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center bg-surface-2 border border-hairline rounded-lg overflow-hidden">
                {LANGS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                      i18n.language === lang.code
                       ? 'bg-garnet text-bone'
                        : 'text-slate hover:text-bone'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleShare}
                className="relative text-sm bg-surface-2 hover:bg-surface-3 border border-hairline text-fog hover:text-bone px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? 'Link copied ✓' : 'Share profile'}
              </button>

              <div className="h-6 w-px bg-hairline" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-garnet-bright to-garnet-dim flex items-center justify-center text-sm font-semibold text-bone flex-shrink-0">
                  {initial}
                </div>
                <span className="text-sm text-fog">
                  {user?.displayName || user?.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm text-slate hover:text-bone transition-colors"
              >
                Log out
              </button>
            </div>

            {/* Mobile trigger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden text-fog hover:text-bone p-2 -mr-2"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-hairline bg-stage px-4 pb-4 pt-2 space-y-1 df-animate-in">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-surface-2 text-bone'
                    : 'text-fog hover:bg-surface-2 hover:text-bone'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-hairline">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-garnet-bright to-garnet-dim flex items-center justify-center text-sm font-semibold text-bone flex-shrink-0">
                {initial}
              </div>
              <span className="text-sm text-fog flex-1 truncate">
                {user?.displayName || user?.username}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="w-full text-left text-sm text-fog hover:text-bone px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              {copied ? 'Link copied ✓' : 'Share profile'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-slate hover:text-bone px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
