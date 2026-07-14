import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { entriesApi } from '../api/entries';
import type { Entry, Stats } from '../types';
import { useTranslation } from 'react-i18next';
import { useRandomGreeting } from '../hooks/useRandomGreeting';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const RATING_GRADIENT = ['#5c1a26', '#8f1330', '#b8425a', '#cf9d4f', '#e8c98a'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="df-card p-6">
      <p className="text-fog text-sm">{label}</p>
      <p className="text-3xl font-display font-semibold text-bone mt-1">{value}</p>
      {sub && <p className="text-slate text-xs mt-1">{sub}</p>}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="df-card p-6">
      <div className="df-skeleton h-3.5 w-20 rounded mb-3" />
      <div className="df-skeleton h-8 w-16 rounded" />
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div className="df-card df-card-hover overflow-hidden">
      {entry.movie.posterUrl ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
          alt={entry.movie.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-surface-2 flex items-center justify-center">
          <span className="text-slate text-4xl">🎬</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-bone font-medium text-sm truncate">{entry.movie.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-slate text-xs">{entry.movie.releaseYear ?? '—'}</p>
          {entry.rating && (
            <p className="text-gold text-sm font-semibold">★ {entry.rating}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingChart({ entries }: { entries: Entry[] }) {
  const { t } = useTranslation();
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
      e => e.rating !== null && e.rating >= bucket.min && e.rating <= bucket.max
    ).length,
  }));

  return (
    <div className="df-card p-6">
      <h3 className="text-bone font-display font-semibold mb-4">{t('dashboard.ratingDist')}</h3>
      {data.every(d => d.count === 0) ? (
        <p className="text-slate text-sm py-10 text-center">{t('dashboard.noRatings')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="label" tick={{ fill: '#a8a2a6', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#a8a2a6', fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1b191d',
                border: '1px solid #2a262b',
                borderRadius: '8px',
                color: '#f2ede4',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={RATING_GRADIENT[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function StatusBreakdown({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  const items = [
    { label: t('dashboard.watched'), value: stats.totalWatched, color: 'bg-status-watched' },
    { label: t('dashboard.watching'), value: stats.watching, color: 'bg-status-watching' },
    { label: t('dashboard.planToWatch'), value: stats.planToWatch, color: 'bg-status-plan' },
    { label: t('dashboard.dropped'), value: stats.dropped, color: 'bg-status-dropped' },
  ];

  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="df-card p-6">
      <h3 className="text-bone font-display font-semibold mb-4">{t('dashboard.breakdown')}</h3>
      <div className="space-y-3.5">
        {items.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-fog">{item.label}</span>
              <span className="text-bone font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-surface-2 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const greeting = useRandomGreeting();
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

  return (
    <div className="space-y-8 df-animate-in">
      <div>
        <p className="text-fog text-sm mb-1">{greeting} 👋</p>
        <h1 className="text-3xl font-display font-semibold text-bone">
          {user?.displayName || user?.username}
        </h1>
        <p className="text-fog mt-1">{t('dashboard.overview')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label={t('dashboard.moviesWatched')} value={stats.moviesWatched} />
            <StatCard label={t('dashboard.tvWatched')} value={stats.tvShowsWatched} />
            <StatCard label={t('dashboard.avgRating')} value={stats.averageRating ?? '—'} sub={t('dashboard.outOf')} />
            <StatCard
              label={t('dashboard.totalCollection')}
              value={stats.totalWatched + stats.planToWatch + stats.watching + stats.dropped}
            />
          </>
        )}
      </div>

      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingChart entries={allEntries} />
          <StatusBreakdown stats={stats} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-bone">{t('dashboard.recentlyAdded')}</h2>
          <Link to="/collection" className="text-gold hover:text-gold-soft text-sm transition-colors">
            {t('dashboard.viewAll')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="df-skeleton aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="df-card p-12 text-center">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-fog">{t('dashboard.empty')}</p>
            <p className="text-slate text-sm mt-1">{t('dashboard.emptyHint')}</p>
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