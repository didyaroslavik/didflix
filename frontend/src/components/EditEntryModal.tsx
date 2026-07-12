import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { entriesApi } from '../api/entries';
import type { Entry } from '../types';
import Portal from './Portal';

interface Props {
  entry: Entry;
  onClose: () => void;
  onUpdated: (entry: Entry) => void;
  onDeleted: (id: string) => void;
}

export default function EditEntryModal({ entry, onClose, onUpdated, onDeleted }: Props) {
  const { t } = useTranslation();
  
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating?.toString() ?? '');
  const [review, setReview] = useState(entry.review ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
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
      const data = await entriesApi.update(entry.id, {
        status,
        rating: rating ? parseFloat(rating) : undefined,
        review: review || undefined,
      });
      onUpdated(data.entry);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      await entriesApi.delete(entry.id);
      onDeleted(entry.id);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <div
          className="bg-surface rounded-2xl w-full max-w-md border border-hairline df-animate-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              {entry.movie.posterUrl && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${entry.movie.posterUrl}`}
                  alt={entry.movie.title}
                  className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-display font-semibold text-bone truncate">
                  {entry.movie.title}
                </h2>
                <p className="text-slate text-sm">{entry.movie.releaseYear ?? '—'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate hover:text-bone transition-colors ml-4 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {error && (
              <div className="bg-garnet-dim/30 border border-garnet/50 text-garnet-glow rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-fog mb-1.5">{t('modal.status')}</label>
              <select
                value={status}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={e => setStatus(e.target.value as any)}
                className="df-input w-full rounded-lg px-4 py-2.5"
              >
                <option value="WATCHED">{t('collection.watched')}</option>
                <option value="WATCHING">{t('collection.watching')}</option>
                <option value="PLAN_TO_WATCH">{t('collection.planToWatch')}</option>
                <option value="DROPPED">{t('collection.dropped')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fog mb-1.5">
                {t('modal.rating')} <span className="text-slate">{t('modal.ratingHint')}</span>
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
                {t('modal.review')} <span className="text-slate">{t('modal.reviewHint')}</span>
              </label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                rows={3}
                className="df-input w-full rounded-lg px-4 py-2.5 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="df-btn-primary w-full disabled:opacity-50 rounded-lg px-4 py-2.5"
            >
              {loading ? t('modal.saving') : t('modal.save')}
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                confirmDelete
                  ? 'bg-garnet text-bone hover:bg-garnet-bright'
                  : 'text-slate hover:text-garnet-glow'
              }`}
            >
              {confirmDelete ? t('modal.confirmRemove') : t('modal.remove')}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}