export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  shareToken: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  type: 'MOVIE' | 'TV_SHOW';
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  releaseYear: number | null;
  runtime: number | null;
  director: string | null;
  tmdbRating: number | null;
  genres: { genre: Genre }[];
}

export interface Entry {
  id: string;
  rating: number | null;
  review: string | null;
  status: 'WATCHED' | 'WATCHING' | 'DROPPED' | 'PLAN_TO_WATCH';
  watchedDate: string | null;
  rewatchCount: number;
  createdAt: string;
  updatedAt: string;
  movie: Movie;
}

export interface Stats {
  totalWatched: number;
  moviesWatched: number;
  tvShowsWatched: number;
  averageRating: number | null;
  planToWatch: number;
  watching: number;
  dropped: number;
}