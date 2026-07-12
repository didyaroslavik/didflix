import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, type PublicProfile, type PublicStats } from '../api/public';
import type { Entry } from '../types';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import Logo from '../components/Logo';

const STATUS_CLASSES: Record<string, string> = {
  WATCHED: 'bg-status-watched/15 text-status-watched',
  WATCHING: 'bg-status-watching/15 text-status-watching',
  PLAN_TO_WATCH: 'bg-status-plan/15 text-status-plan',
  DROPPED: 'bg-status-dropped/15 text-status-dropped',
};

// Helper function to translate status dynamically
function getStatusLabel(status: string, t: TFunction) {
  const map: Record<string, string> = {
    WATCHED: t('collection.watched'),
    WATCHING: t('collection.watching'),
    PLAN_TO_WATCH: t('collection.planToWatch'),
    DROPPED: t('collection.dropped'),
  };
  return map[status] || status;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-2 border border-hairline rounded-xl p-4 text-center">
      <p className="text-2xl font-display font-semibold text-bone">{value}</p>
      <p className="text-fog text-sm mt-1">{label}</p>
    </div>
  );
}

export default function PublicProfilePage() {
  const { t, i18n } = useTranslation();
  
  const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'ua', label: 'UA' },
    { code: 'pl', label: 'PL' },
  ];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('didflix-lang', code);
  };

  const { token } = useParams<{ token: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');

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
        <p className="text-fog">{t('profile.loading')}</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen df-cinema-backdrop flex items-center justify-center px-4">
        <div className="text-center df-animate-in">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-bone text-xl font-display font-semibold">{t('profile.notFound')}</p>
          <p className="text-fog mt-2">{t('profile.notFoundHint')}</p>
          <Link to="/login" className="text-gold hover:text-gold-soft mt-4 inline-block transition-colors">
            {t('profile.goTo')}
          </Link>
        </div>
      </div>
    );
  }

  const filteredEntries = entries
    .filter(e => filter ? e.status === filter : true)
    .sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === 'rating_asc') return (a.rating ?? 0) - (b.rating ?? 0);
      if (sort === 'title') return a.movie.title.localeCompare(b.movie.title);
      // newest first (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const memberYear = profile?.memberSince
    ? new Date(profile.memberSince).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-abyss">
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
                <p className="text-slate text-sm mt-1">{t('profile.memberSince')} {memberYear}</p>
              )}
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Language switcher */}
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

              <Link to="/login">
                <Logo variant="mark" className="text-3xl" />
              </Link>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <StatCard label={t('profile.moviesWatched')} value={stats.moviesWatched} />
              <StatCard label={t('profile.tvWatched')} value={stats.tvShowsWatched} />
              <StatCard label={t('profile.avgRating')} value={stats.averageRating ?? '—'} />
              <StatCard label={t('profile.totalEntries')} value={stats.totalInCollection} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl font-display font-semibold text-bone">
            {t('profile.collection')}
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="df-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">{t('collection.newest')}</option>
              <option value="rating">{t('collection.highestRated')}</option>
              <option value="rating_asc">{t('collection.lowestRated')}</option>
              <option value="title">{t('collection.alphabetical')}</option>
            </select>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="df-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t('profile.all')}</option>
              <option value="WATCHED">{t('collection.watched')}</option>
              <option value="WATCHING">{t('collection.watching')}</option>
              <option value="PLAN_TO_WATCH">{t('collection.planToWatch')}</option>
              <option value="DROPPED">{t('collection.dropped')}</option>
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-slate text-center py-16">{t('profile.nothing')}</p>
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
                    {getStatusLabel(entry.status, t)}
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