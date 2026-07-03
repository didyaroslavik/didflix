import axios from 'axios';

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
});

export const tmdbService = {
  async search(query: string) {
    const { data } = await tmdbClient.get('/search/multi', {
      params: { query, include_adult: false },
    });

    return data.results
      .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 8)
      .map((r: any) => ({
        tmdbId: r.id,
        title: r.title || r.name,
        type: r.media_type === 'movie' ? 'MOVIE' : 'TV_SHOW',
        posterUrl: r.poster_path,
        backdropUrl: r.backdrop_path,
        overview: r.overview,
        releaseYear: r.release_date
          ? parseInt(r.release_date.split('-')[0])
          : r.first_air_date
          ? parseInt(r.first_air_date.split('-')[0])
          : null,
        tmdbRating: r.vote_average,
      }));
  },

  async getDetails(tmdbId: number, type: 'movie' | 'tv') {
    const { data: r } = await tmdbClient.get(`/${type}/${tmdbId}`, {
      params: { append_to_response: 'credits' },
    });

    const director =
      type === 'movie'
        ? r.credits?.crew?.find((c: any) => c.job === 'Director')?.name
        : null;

    return {
      tmdbId: r.id,
      title: r.title || r.name,
      type: type === 'movie' ? 'MOVIE' : 'TV_SHOW',
      posterUrl: r.poster_path,
      backdropUrl: r.backdrop_path,
      overview: r.overview,
      releaseYear: r.release_date
        ? parseInt(r.release_date.split('-')[0])
        : r.first_air_date
        ? parseInt(r.first_air_date.split('-')[0])
        : null,
      runtime: r.runtime || null,
      director: director || null,
      tmdbRating: r.vote_average,
      genres: r.genres?.map((g: any) => g.name) || [],
    };
  },
};