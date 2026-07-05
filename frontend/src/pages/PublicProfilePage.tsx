import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, type PublicProfile, type PublicStats } from '../api/public';
import type { Entry } from '../types';
import Logo from '../components/Logo';

const STATUS_CLASSES: Record<string, string> = {
  WATCHED: 'bg-status-watched/15 text-status-watched',
  WATCHING: 'bg-status-watching/15 text-status-watching',
  PLAN_TO_WATCH: 'bg-status-plan/15 text-status-plan',
  DROPPED: 'bg-status-dropped/15 text-status-dropped',
};

const STATUS_LABELS: Record<string, string> = {
  WATCHED: 'Watched',
  WATCHING: 'Watching',
  PLAN_TO_WATCH: 'Plan to Watch',
  DROPPED: 'Dropped',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-2 border border-hairline rounded-xl p-4 text-center">
      <p className="text-2xl font-display font-semibold text-bone">{value}</p>
      <p className="text-fog text-sm mt-1">{label}</p>
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
      <div className="min-h-screen df-cinema-backdrop flex items-center justify-center">
        <p className="text-fog">Loading profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen df-cinema-backdrop flex items-center justify-center px-4">
        <div className="text-center df-animate-in">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-bone text-xl font-display font-semibold">Profile not found</p>
          <p className="text-fog mt-2">This link may be invalid or expired.</p>
          <Link to="/login" className="text-gold hover:text-gold-soft mt-4 inline-block transition-colors">
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
    <div className="min-h-screen bg-abyss">
      {/* Header */}
      <div className="df-cinema-backdrop border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-4 flex-wrap">

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-garnet-bright to-garnet-dim flex items-center justify-center text-2xl font-bold text-bone flex-shrink-0">
              {(profile?.displayName || profile?.username || '?')[0].toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-display font-semibold text-bone">
                {profile?.displayName || profile?.username}
              </h1>
              <p className="text-fog">@{profile?.username}</p>
              {memberYear && (
                <p className="text-slate text-sm mt-1">Member since {memberYear}</p>
              )}
            </div>

            <div className="ml-auto">
              <Link to="/login">
                <Logo variant="mark" className="text-3xl" />
              </Link>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
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
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-display font-semibold text-bone">Collection</h2>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="df-input rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="WATCHED">Watched</option>
            <option value="WATCHING">Watching</option>
            <option value="PLAN_TO_WATCH">Plan to Watch</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-slate text-center py-16">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="df-card df-card-hover overflow-hidden">
                {entry.movie.posterUrl ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
                    alt={entry.movie.title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-surface-2 flex items-center justify-center">
                    <span className="text-3xl">🎬</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-bone text-sm font-medium truncate">
                    {entry.movie.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate text-xs">
                      {entry.movie.releaseYear ?? '—'}
                    </span>
                    {entry.rating && (
                      <span className="text-gold text-xs font-bold">
                        ★ {entry.rating}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${STATUS_CLASSES[entry.status]}`}>
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
