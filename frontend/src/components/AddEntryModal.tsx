import { useState, useEffect, useRef } from 'react';
import { entriesApi } from '../api/entries';
import { tmdbApi, type TmdbResult } from '../api/tmdb';
import type { Entry } from '../types';


interface Props {
  onClose: () => void;
  onAdded: (entry: Entry) => void;
}

export default function AddEntryModal({ onClose, onAdded }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [searching, setSearching] = useState(false);

  const [status, setStatus] = useState('WATCHED');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — waits 400ms after user stops typing
  useEffect(() => {
    if (query.length < 2) {
      // eslint-disable-next-line
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await tmdbApi.search(query);
        setResults(data);
      } catch {
        // silently fail search
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (result: TmdbResult) => {
    setSelected(result);
    setResults([]);
    setQuery('');
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError('Please search and select a title first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await entriesApi.create({
        movieData: {
          tmdbId: selected.tmdbId,
          title: selected.title,
          type: selected.type,
          posterUrl: selected.posterUrl ?? undefined,
          overview: selected.overview ?? undefined,
          releaseYear: selected.releaseYear ?? undefined,
          genres: [],
        },
        rating: rating ? parseFloat(rating) : undefined,
        review: review || undefined,
        status,
      });

      onAdded(data.entry);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add to collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Search */}
        {!selected && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Search for a movie or TV show
            </label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Interstellar"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />

            {/* Search results dropdown */}
            {searching && (
              <p className="text-gray-500 text-sm mt-2">Searching...</p>
            )}
            {results.length > 0 && (
              <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {results.map(result => (
                  <button
                    key={result.tmdbId}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                  >
                    {result.posterUrl ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${result.posterUrl}`}
                        alt={result.title}
                        className="w-8 h-12 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-lg">
                        🎬
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{result.title}</p>
                      <p className="text-gray-400 text-xs">
                        {result.type === 'MOVIE' ? 'Movie' : 'TV Show'} · {result.releaseYear ?? '—'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected movie */}
        {selected && (
          <div className="mb-4 flex items-center gap-3 bg-gray-800 rounded-lg p-3">
            {selected.posterUrl ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${selected.posterUrl}`}
                alt={selected.title}
                className="w-10 h-14 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-14 bg-gray-700 rounded flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-white font-medium">{selected.title}</p>
              <p className="text-gray-400 text-sm">{selected.releaseYear ?? '—'}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-500 hover:text-white text-sm"
            >
              Change
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="WATCHED">Watched</option>
              <option value="WATCHING">Watching</option>
              <option value="PLAN_TO_WATCH">Plan to Watch</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Rating <span className="text-gray-600">(1–10, optional)</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={rating}
              onChange={e => setRating(e.target.value)}
              placeholder="8.5"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Review <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            {loading ? 'Adding...' : 'Add to collection'}
          </button>
        </div>
      </div>
    </div>
  );
}