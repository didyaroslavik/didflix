import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { tmdbApi, type TmdbResult } from '../api/tmdb';
import { entriesApi } from '../api/entries';
import type { Entry } from '../types';

interface Props {
  onAdded: (entry: Entry) => void;
}

export default function QuickAdd({ onAdded }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [status, setStatus] = useState('WATCHED');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only return early, don't set state here to avoid the ESLint warning
    if (query.length < 2) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await tmdbApi.search(query);
        setResults(data);
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: TmdbResult) => {
    setSelected(result);
    setResults([]);
    setQuery('');
    setError('');
  };

  const handleAdd = async () => {
    if (!selected) return;

    if (rating) {
      const r = parseFloat(rating);
      if (isNaN(r) || r < 1 || r > 10) {
        setError(t('modal.ratingError'));
        return;
      }
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
      setSelected(null);
      setRating('');
      setReview('');
      setStatus('WATCHED');
      setSuccess(`"${data.entry.movie.title}" added to your collection!`);
      setTimeout(() => setSuccess(''), 3000);
      inputRef.current?.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    setError('');
    setRating('');
    setReview('');
    setStatus('WATCHED');
  };

  return (
    <div className="df-card p-6">
      {/* Success message */}
      {success && (
        <div className="bg-status-watched/15 border border-status-watched/30 text-status-watched rounded-lg px-4 py-3 mb-4 text-sm df-animate-in">
          ✓ {success}
        </div>
      )}

      {/* Search bar */}
      {!selected && (
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate flex-shrink-0"
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              const val = e.target.value;
              setQuery(val);
              if (val.length < 2) {
                setResults([]);
              }
            }}
            placeholder={t('modal.search')}
            className="df-input w-full rounded-xl pl-11 pr-4 py-3 text-base"
            autoComplete="off"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-garnet border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && !selected && (
        <div className="mt-2 bg-surface-2 rounded-xl border border-hairline overflow-hidden df-animate-in">
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
                <div className="w-8 h-12 bg-surface-3 rounded flex-shrink-0 flex items-center justify-center">
                  🎬
                </div>
              )}
              <div className="min-w-0">
                <p className="text-bone text-sm font-medium truncate">{result.title}</p>
                <p className="text-slate text-xs">
                  {result.type === 'MOVIE' ? t('collection.movies').slice(0, -1) : 'TV Show'}
                  {' · '}{result.releaseYear ?? '—'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected movie — quick add form */}
      {selected && (
        <div className="df-animate-in space-y-4">
          {/* Selected title header */}
          <div className="flex items-center gap-3">
            {selected.posterUrl ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${selected.posterUrl}`}
                alt={selected.title}
                className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-14 bg-surface-2 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-bone font-semibold truncate">{selected.title}</p>
              <p className="text-slate text-sm">{selected.releaseYear ?? '—'}</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-slate hover:text-bone transition-colors text-sm flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-garnet-dim/30 border border-garnet/50 text-garnet-glow rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Inline form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-fog mb-1.5">
                {t('modal.status')}
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="df-input w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="WATCHED">{t('collection.watched')}</option>
                <option value="WATCHING">{t('collection.watching')}</option>
                <option value="PLAN_TO_WATCH">{t('collection.planToWatch')}</option>
                <option value="DROPPED">{t('collection.dropped')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fog mb-1.5">
                {t('modal.rating')} <span className="text-slate">(1–10)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={rating}
                onChange={e => setRating(e.target.value)}
                placeholder="8.5"
                className="df-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAdd}
                disabled={loading}
                className="df-btn-primary w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? t('modal.adding') : '+ ' + t('modal.add').replace(' to collection', '')}
              </button>
            </div>
          </div>

          {/* Optional review — collapsed by default */}
          <details className="group">
            <summary className="text-slate text-xs cursor-pointer hover:text-fog transition-colors list-none flex items-center gap-1">
              <span className="group-open:hidden">▶</span>
              <span className="hidden group-open:inline">▼</span>
              Add a review (optional)
            </summary>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder={t('modal.review')}
              rows={2}
              className="df-input w-full rounded-lg px-3 py-2 text-sm resize-none mt-2"
            />
          </details>
        </div>
      )}
    </div>
  );
}