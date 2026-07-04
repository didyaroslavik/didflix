import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicApi, type UserSearchResult } from '../api/public';

export default function FindUsersPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { 
      // eslint-disable-next-line
      setResults([]);
      // eslint-disable-next-line
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

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
  }, [query]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Find Users</h1>
        <p className="text-gray-400 mt-1">Search for people on DidFlix</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by username..."
        autoFocus
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />

      {searching && <p className="text-gray-500 text-sm">Searching...</p>}

      {searched && results.length === 0 && (
        <p className="text-gray-500">No users found for "{query}"</p>
      )}

      <div className="space-y-3">
        {results.map(user => (
          <Link
            key={user.shareToken}
            to={`/u/${user.shareToken}`}
            className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              {(user.displayName || user.username)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">
                {user.displayName || user.username}
              </p>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {user._count.entries} titles in collection
              </p>
            </div>
            <span className="ml-auto text-gray-600">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}