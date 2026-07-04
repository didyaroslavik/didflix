import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { entriesApi } from '../api/entries';
import type { Entry, Stats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

// --- Stat Card ---
function StatCard({
  label,
  value,
  sub
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// --- Entry Card ---
function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
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
        <p className="text-gray-500 text-xs">{entry.movie.releaseYear ?? '—'}</p>
        {entry.rating && (
          <p className="text-yellow-400 text-sm font-bold mt-1">★ {entry.rating}</p>
        )}
      </div>
    </div>
  );
}

// --- Rating Distribution Chart ---
function RatingChart({ entries }: { entries: Entry[] }) {
  // Build buckets: 1-2, 3-4, 5-6, 7-8, 9-10
  const buckets = [
    { label: '1-2', min: 1, max: 2.9 },
    { label: '3-4', min: 3, max: 4.9 },
    { label: '5-6', min: 5, max: 6.9 },
    { label: '7-8', min: 7, max: 8.9 },
    { label: '9-10', min: 9, max: 10 },
  ];

  const data = buckets.map(bucket => ({
    label: bucket.label,
    count: entries.filter(
      e => e.rating !== null &&
        e.rating >= bucket.min &&
        e.rating <= bucket.max
    ).length,
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
      {data.every(d => d.count === 0) ? (
        <p className="text-gray-500 text-sm">No ratings yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// --- Status Breakdown ---
function StatusBreakdown({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Watched', value: stats.totalWatched, color: 'bg-green-500' },
    { label: 'Watching', value: stats.watching, color: 'bg-blue-500' },
    { label: 'Plan to Watch', value: stats.planToWatch, color: 'bg-yellow-500' },
    { label: 'Dropped', value: stats.dropped, color: 'bg-red-500' },
  ];

  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-white font-semibold mb-4">Collection Breakdown</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{item.label}</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all`}
                style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, entriesData] = await Promise.all([
          entriesApi.getStats(),
          entriesApi.getAll(),
        ]);
        setStats(statsData.stats);
        setAllEntries(entriesData.entries);
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
        <p className="text-gray-400 mt-1">Here's your watching overview</p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Movies watched"
            value={stats.moviesWatched}
          />
          <StatCard
            label="TV shows watched"
            value={stats.tvShowsWatched}
          />
          <StatCard
            label="Average rating"
            value={stats.averageRating ?? '—'}
            sub="out of 10"
          />
          <StatCard
            label="Total in collection"
            value={stats.totalWatched + stats.planToWatch + stats.watching + stats.dropped}
          />
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingChart entries={allEntries} />
          <StatusBreakdown stats={stats} />
        </div>
      )}

      {/* Recently Added */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recently added</h2>
          <Link to="/collection" className="text-blue-400 hover:text-blue-300 text-sm">
            View all →
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400">Your collection is empty.</p>
            <p className="text-gray-600 text-sm mt-1">Add your first movie to get started!</p>
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