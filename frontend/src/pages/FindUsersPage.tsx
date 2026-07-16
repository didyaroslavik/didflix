import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicApi, type UserSearchResult } from '../api/public';
import { useTranslation } from 'react-i18next';

function ResultSkeleton() {
  return (
    <div className="df-card p-4 flex items-center gap-4">
      <div className="df-skeleton w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="df-skeleton h-4 w-32 rounded" />
        <div className="df-skeleton h-3 w-20 rounded" />
      </div>
    </div>
  );
}

export default function FindUsersPage() {
  const { t } = useTranslation();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setTimeout(() => {
        setResults([]);
        setSearched(false);
      }, 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await publicApi.searchUsers(query);
        setResults(data);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="space-y-6 max-w-2xl df-animate-in">
      <div>
        <h1 className="text-3xl font-display font-semibold text-bone">{t('findUsers.title')}</h1>
        <p className="text-fog mt-1">{t('findUsers.subtitle')}</p>
      </div>

      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('findUsers.placeholder')}
          autoFocus
          className="df-input w-full rounded-xl pl-11 pr-4 py-3"
        />
      </div>

      <div className="space-y-3">
        {searching && (
          <>
            <ResultSkeleton />
            <ResultSkeleton />
          </>
        )}

        {!searching && searched && results.length === 0 && (
          <div className="df-card p-10 text-center">
            <p className="text-fog">{t('findUsers.noResults')} "{query}"</p>
          </div>
        )}

        {!searching && results.map(user => (
          <Link
            key={user.shareToken}
            to={`/u/${user.shareToken}`}
            className="df-card df-card-hover flex items-center gap-4 p-4"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-garnet-bright to-garnet-dim flex items-center justify-center text-lg font-bold text-bone flex-shrink-0">
              {(user.displayName || user.username)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-bone font-medium truncate">
                {user.displayName || user.username}
              </p>
              <p className="text-fog text-sm">@{user.username}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate text-xs">
                  {user._count.entries} {t('findUsers.titles')}
                </span>
                <span className="text-slate text-xs flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {user.viewCount}
                </span>
                <span className="text-slate text-xs flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {user.likeCount}
                </span>
              </div>
            </div>
            <span className="ml-auto text-slate">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}