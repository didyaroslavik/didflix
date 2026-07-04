import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, type PublicProfile, type PublicStats } from '../api/public';
import type { Entry } from '../types';

const STATUS_COLORS: Record<string, string> = {
  WATCHED: 'bg-green-500/20 text-green-400',
  WATCHING: 'bg-blue-500/20 text-blue-400',
  PLAN_TO_WATCH: 'bg-yellow-500/20 text-yellow-400',
  DROPPED: 'bg-red-500/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  WATCHED: 'Watched',
  WATCHING: 'Watching',
  PLAN_TO_WATCH: 'Plan to Watch',
  DROPPED: 'Dropped',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  );
}

export default function PublicProfilePage() {
  const { token } = useParams<{ token: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!token) return;

    publicApi.getProfile(token)
      .then(data => {
        setProfile(data.profile);
        setStats(data.stats);
        setEntries(data.entries);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-white text-xl font-semibold">Profile not found</p>
          <p className="text-gray-400 mt-2">This link may be invalid or expired.</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 mt-4 block">
            Go to DidFlix →
          </Link>
        </div>
      </div>
    );
  }

  const filteredEntries = filter
    ? entries.filter(e => e.status === filter)
    : entries;

  const memberYear = profile?.memberSince
    ? new Date(profile.memberSince).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {(profile?.displayName || profile?.username || '?')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile?.displayName || profile?.username}
              </h1>
              <p className="text-gray-400">@{profile?.username}</p>
              {memberYear && (
                <p className="text-gray-500 text-sm mt-1">Member since {memberYear}</p>
              )}
            </div>

            {/* DidFlix branding */}
            <div className="ml-auto">
              <Link to="/login" className="text-gray-400 hover:text-white text-sm">
                🎬 DidFlix
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <StatCard label="Movies watched" value={stats.moviesWatched} />
              <StatCard label="TV shows watched" value={stats.tvShowsWatched} />
              <StatCard label="Avg rating" value={stats.averageRating ?? '—'} />
              <StatCard label="Total entries" value={stats.totalInCollection} />
            </div>
          )}
        </div>
      </div>

      {/* Collection */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Collection</h2>

          {/* Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">All</option>
            <option value="WATCHED">Watched</option>
            <option value="WATCHING">Watching</option>
            <option value="PLAN_TO_WATCH">Plan to Watch</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                {entry.movie.posterUrl ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
                    alt={entry.movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl">🎬</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {entry.movie.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-xs">
                      {entry.movie.releaseYear ?? '—'}
                    </span>
                    {entry.rating && (
                      <span className="text-yellow-400 text-xs font-bold">
                        ★ {entry.rating}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${STATUS_COLORS[entry.status]}`}>
                    {STATUS_LABELS[entry.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}