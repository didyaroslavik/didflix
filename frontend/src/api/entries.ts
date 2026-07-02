import client from './client';
import type { Entry, Stats } from '../types';

export const entriesApi = {
  getAll: async (params?: { type?: string; status?: string; sort?: string }) => {
    const res = await client.get<{ entries: Entry[] }>('/entries', { params });
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await client.get<{ entry: Entry }>(`/entries/${id}`);
    return res.data;
  },

  create: async (data: {
    movieData: {
      tmdbId: number;
      title: string;
      type: 'MOVIE' | 'TV_SHOW';
      posterUrl?: string;
      overview?: string;
      releaseYear?: number;
      director?: string;
      genres?: string[];
    };
    rating?: number;
    review?: string;
    status: string;
    watchedDate?: string;
  }) => {
    const res = await client.post<{ entry: Entry }>('/entries', data);
    return res.data;
  },

  update: async (id: string, data: {
    rating?: number;
    review?: string;
    status?: string;
    watchedDate?: string;
    rewatchCount?: number;
  }) => {
    const res = await client.put<{ entry: Entry }>(`/entries/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await client.delete(`/entries/${id}`);
  },

  getStats: async () => {
    const res = await client.get<{ stats: Stats }>('/entries/stats');
    return res.data;
  },
};