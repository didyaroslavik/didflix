import { useState } from 'react';
import { entriesApi } from '../api/entries';
import type { Entry } from '../types';

interface Props {
  onClose: () => void;
  onAdded: (entry: Entry) => void;
}

export default function AddEntryModal({ onClose, onAdded }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'MOVIE' | 'TV_SHOW'>('MOVIE');
  const [status, setStatus] = useState('WATCHED');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await entriesApi.create({
        movieData: {
          tmdbId: Math.floor(Math.random() * 1000000), // temporary until TMDB integration
          title: title.trim(),
          type,
          releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        },
        rating: rating ? parseFloat(rating) : undefined,
        review: review || undefined,
        status,
      });

      onAdded(data.entry);
      onClose();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add to collection</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Interstellar"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'MOVIE' | 'TV_SHOW')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="MOVIE">Movie</option>
                <option value="TV_SHOW">TV Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
              <input
                type="number"
                value={releaseYear}
                onChange={e => setReleaseYear(e.target.value)}
                placeholder="2024"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

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
              Rating <span className="text-gray-600">(1-10, optional)</span>
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            {loading ? 'Adding...' : 'Add to collection'}
          </button>
        </div>
      </div>
    </div>
  );
}