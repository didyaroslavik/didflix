import client from './client';

export interface TmdbResult {
  tmdbId: number;
  title: string;
  type: 'MOVIE' | 'TV_SHOW';
  posterUrl: string | null;
  overview: string | null;
  releaseYear: number | null;
  tmdbRating: number | null;
}

export const tmdbApi = {
  search: async (query: string): Promise<TmdbResult[]> => {
    const res = await client.get<{ results: TmdbResult[] }>('/tmdb/search', {
      params: { q: query },
    });
    return res.data.results;
  },
};