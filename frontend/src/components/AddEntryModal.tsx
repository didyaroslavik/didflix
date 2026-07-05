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

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-md border border-hairline max-h-[90vh] overflow-y-auto df-animate-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-display font-semibold text-bone">Add to collection</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate hover:text-bone transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          {error && (
            <div className="bg-garnet-dim/30 border border-garnet/50 text-garnet-glow rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Search */}
          {!selected && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fog mb-1.5">
                Search for a movie or TV show
              </label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Interstellar"
                autoFocus
                className="df-input w-full rounded-lg px-4 py-2.5"
              />

              {searching && (
                <p className="text-slate text-sm mt-2">Searching...</p>
              )}
              {results.length > 0 && (
                <div className="mt-2 bg-surface-2 rounded-lg border border-hairline overflow-hidden">
                  {results.map(result => (
                    <button
                      key={result.tmdbId}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-surface-3 transition-colors text-left"
                    >
                      {result.posterUrl ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${result.posterUrl}`}
                          alt={result.title}
                          className="w-8 h-12 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-surface-3 rounded flex-shrink-0 flex items-center justify-center text-lg">
                          🎬
                        </div>
                      )}
                      <div>
                        <p className="text-bone text-sm font-medium">{result.title}</p>
                        <p className="text-slate text-xs">
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
            <div className="mb-4 flex items-center gap-3 bg-surface-2 rounded-lg p-3 border border-hairline">
              {selected.posterUrl ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${selected.posterUrl}`}
                  alt={selected.title}
                  className="w-10 h-14 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-14 bg-surface-3 rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-bone font-medium truncate">{selected.title}</p>
                <p className="text-slate text-sm">{selected.releaseYear ?? '—'}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate hover:text-bone text-sm flex-shrink-0"
              >
                Change
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fog mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="df-input w-full rounded-lg px-4 py-2.5"
              >
                <option value="WATCHED">Watched</option>
                <option value="WATCHING">Watching</option>
                <option value="PLAN_TO_WATCH">Plan to Watch</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fog mb-1.5">
                Rating <span className="text-slate">(1–10, optional)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={rating}
                onChange={e => setRating(e.target.value)}
                placeholder="8.5"
                className="df-input w-full rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fog mb-1.5">
                Review <span className="text-slate">(optional)</span>
              </label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="What did you think?"
                rows={3}
                className="df-input w-full rounded-lg px-4 py-2.5 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selected}
              className="df-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5"
            >
              {loading ? 'Adding...' : 'Add to collection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
