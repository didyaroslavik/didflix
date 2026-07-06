import { useEffect, useState } from 'react';
import { entriesApi } from '../api/entries';
import type { Entry } from '../types';
import AddEntryModal from '../components/AddEntryModal';
import EditEntryModal from '../components/EditEntryModal';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'rating' | 'title';

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

function GridCard({ entry, onEdit }: { entry: Entry; onEdit: (e: Entry) => void }) {
  const { t } = useTranslation();
  return (
    <div className="df-card df-card-hover overflow-hidden group">
      <div className="relative">
        {entry.movie.posterUrl ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
            alt={entry.movie.title}
            className="w-full aspect-[2/3] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-surface-2 flex items-center justify-center">
            <span className="text-5xl">🎬</span>
          </div>
        )}
        {entry.rating && (
          <div className="absolute top-2 right-2 bg-abyss/80 backdrop-blur-sm text-gold text-xs font-bold px-2 py-1 rounded-lg">
            ★ {entry.rating}
          </div>
        )}
        
        <button
          onClick={() => onEdit(entry)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-bone text-sm font-medium"
        >
          {t('collection.edit')}
        </button>
      </div>
      <div className="p-3">
        <p className="text-bone font-medium text-sm truncate">{entry.movie.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-slate text-xs">{entry.movie.releaseYear ?? '—'}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASSES[entry.status]}`}>
            {getStatusLabel(entry.status, t)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ListRow({ entry, onEdit }: { entry: Entry; onEdit: (e: Entry) => void }) {
  const { t } = useTranslation();
  return (
    <div className="df-card df-card-hover p-4 flex items-center gap-4">
      {entry.movie.posterUrl ? (
        <img
          src={`https://image.tmdb.org/t/p/w92${entry.movie.posterUrl}`}
          alt={entry.movie.title}
          className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-12 h-16 bg-surface-2 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎬</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-bone font-medium truncate">{entry.movie.title}</p>
        <p className="text-slate text-sm">
          {entry.movie.releaseYear ?? '—'} · {entry.movie.type === 'MOVIE' ? t('collection.movie') : t('collection.tvShow')}
        </p>
        {entry.review && (
          <p className="text-fog text-sm mt-1 truncate">{entry.review}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CLASSES[entry.status]}`}>
          {getStatusLabel(entry.status, t)}
        </span>
        {entry.rating ? (
          <span className="text-gold font-bold">★ {entry.rating}</span>
        ) : (
          <span className="text-slate">—</span>
        )}
        
        <button
          onClick={() => onEdit(entry)}
          className="text-slate hover:text-bone text-sm transition-colors flex-shrink-0 ml-2"
        >
          {t('collection.edit')}
        </button>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return <div className="df-skeleton aspect-[2/3] rounded-xl" />;
}

export default function CollectionPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sort, setSort] = useState<SortOption>('newest');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true);
      try {
        const data = await entriesApi.getAll({
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          sort,
        });
        setEntries(data.entries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [sort, typeFilter, statusFilter]);

  const handleEntryAdded = (entry: Entry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const handleEntryUpdated = (updated: Entry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const handleEntryDeleted = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 df-animate-in">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-semibold text-bone">{t('collection.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="df-btn-primary font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
        >
          {t('collection.addMovie')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="df-input rounded-lg px-3 py-2 text-sm"
        >
          <option value="">{t('collection.allTypes')}</option>
          <option value="MOVIE">{t('collection.movies')}</option>
          <option value="TV_SHOW">{t('collection.tvShows')}</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="df-input rounded-lg px-3 py-2 text-sm"
        >
          <option value="">{t('collection.allStatuses')}</option>
          <option value="WATCHED">{t('collection.watched')}</option>
          <option value="WATCHING">{t('collection.watching')}</option>
          <option value="PLAN_TO_WATCH">{t('collection.planToWatch')}</option>
          <option value="DROPPED">{t('collection.dropped')}</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="df-input rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">{t('collection.newest')}</option>
          <option value="rating">{t('collection.highestRated')}</option>
          <option value="title">{t('collection.alphabetical')}</option>
        </select>

        <div className="ml-auto flex items-center bg-surface-2 border border-hairline rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'grid' ? 'bg-surface-3 text-bone' : 'text-slate hover:text-bone'
            }`}
          >
            {t('collection.grid')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'list' ? 'bg-surface-3 text-bone' : 'text-slate hover:text-bone'
            }`}
          >
            {t('collection.list')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="df-card p-16 text-center">
          <p className="text-4xl mb-3">🔎</p>
          <p className="text-fog text-lg">{t('collection.noEntries')}</p>
          <p className="text-slate text-sm mt-1">
            {t('collection.noEntriesHint')}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {entries.map(entry => (
            <GridCard key={entry.id} entry={entry} onEdit={setEditEntry} /> 
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <ListRow key={entry.id} entry={entry} onEdit={setEditEntry} />
          ))}
        </div>
      )}

      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onAdded={handleEntryAdded}
        />
      )}

      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onUpdated={handleEntryUpdated}
          onDeleted={handleEntryDeleted}
        />
      )}
    </div>
  );
}