import { useEffect, useState } from 'react';
import { entriesApi } from '../api/entries';
import type { Entry } from '../types';
import AddEntryModal from '../components/AddEntryModal';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'rating' | 'title';

const STATUS_LABELS: Record<string, string> = {
  WATCHED: 'Watched',
  WATCHING: 'Watching',
  PLAN_TO_WATCH: 'Plan to Watch',
  DROPPED: 'Dropped',
};

const STATUS_COLORS: Record<string, string> = {
  WATCHED: 'bg-green-500/20 text-green-400',
  WATCHING: 'bg-blue-500/20 text-blue-400',
  PLAN_TO_WATCH: 'bg-yellow-500/20 text-yellow-400',
  DROPPED: 'bg-red-500/20 text-red-400',
};

function GridCard({ entry }: { entry: Entry }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
      <div className="relative">
        {entry.movie.posterUrl ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${entry.movie.posterUrl}`}
            alt={entry.movie.title}
            className="w-full aspect-[2/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
            <span className="text-5xl">🎬</span>
          </div>
        )}
        {entry.rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
            ★ {entry.rating}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-medium text-sm truncate">{entry.movie.title}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-500 text-xs">{entry.movie.releaseYear ?? '—'}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status]}`}>
            {STATUS_LABELS[entry.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

function ListRow({ entry }: { entry: Entry }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      {entry.movie.posterUrl ? (
        <img
          src={`https://image.tmdb.org/t/p/w92${entry.movie.posterUrl}`}
          alt={entry.movie.title}
          className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎬</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{entry.movie.title}</p>
        <p className="text-gray-500 text-sm">
          {entry.movie.releaseYear ?? '—'} · {entry.movie.type === 'MOVIE' ? 'Movie' : 'TV Show'}
        </p>
        {entry.review && (
          <p className="text-gray-400 text-sm mt-1 truncate">{entry.review}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[entry.status]}`}>
          {STATUS_LABELS[entry.status]}
        </span>
        {entry.rating ? (
          <span className="text-yellow-400 font-bold">★ {entry.rating}</span>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sort, setSort] = useState<SortOption>('newest');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Collection</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Movie
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All types</option>
          <option value="MOVIE">Movies</option>
          <option value="TV_SHOW">TV Shows</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="WATCHED">Watched</option>
          <option value="WATCHING">Watching</option>
          <option value="PLAN_TO_WATCH">Plan to Watch</option>
          <option value="DROPPED">Dropped</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="rating">Highest rated</option>
          <option value="title">Alphabetical</option>
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-400">Loading collection...</p>
      ) : entries.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center">
          <p className="text-gray-400 text-lg">No entries found</p>
          <p className="text-gray-600 text-sm mt-1">
            Try changing your filters or add something new
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {entries.map(entry => (
            <GridCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <ListRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onAdded={handleEntryAdded}
        />
      )}

    </div>
  );
}