import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { entriesApi } from '../api/entries';
import type { Entry, Stats } from '../types';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
      {entry.movie.posterUrl ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
          alt={entry.movie.title}
          className="w-full aspect-[2/3] object-cover"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
          <span className="text-gray-600 text-4xl">🎬</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-white font-medium text-sm truncate">{entry.movie.title}</p>
        <p className="text-gray-400 text-xs">{entry.movie.releaseYear}</p>
        {entry.rating && (
          <p className="text-yellow-400 text-sm font-bold mt-1">★ {entry.rating}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, entriesData] = await Promise.all([
          entriesApi.getStats(),
          entriesApi.getAll({ sort: 'newest' }),
        ]);
        setStats(statsData.stats);
        setRecentEntries(entriesData.entries.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.displayName || user?.username} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's what's in your collection</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Movies watched" value={stats.moviesWatched} />
          <StatCard label="TV shows watched" value={stats.tvShowsWatched} />
          <StatCard label="Average rating" value={stats.averageRating ?? '—'} />
          <StatCard label="Plan to watch" value={stats.planToWatch} />
        </div>
      )}

      {/* Recently added */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recently added</h2>
          <Link
            to="/collection"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View all →
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400">Your collection is empty.</p>
            <p className="text-gray-600 text-sm mt-1">
              Add your first movie to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recentEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}