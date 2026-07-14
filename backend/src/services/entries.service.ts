import { prisma } from '../lib/prisma';
import { Status } from '@prisma/client';

interface MovieData {
  tmdbId: number;
  title: string;
  type: 'MOVIE' | 'TV_SHOW';
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  releaseYear?: number;
  runtime?: number;
  director?: string;
  tmdbRating?: number;
  genres?: string[];
}

interface CreateEntryInput {
  userId: string;
  movieData: MovieData;
  rating?: number;
  review?: string;
  status: Status;
  watchedDate?: string;
}

interface UpdateEntryInput {
  rating?: number;
  review?: string;
  status?: Status;
  watchedDate?: string;
  rewatchCount?: number;
}

export class EntriesService {
  async getEntries(
    userId: string,
    filters?: { type?: string; status?: string },
    sort?: string
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.movie = { type: filters.type };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const orderBy: any = {};
    if (sort === 'rating') orderBy.rating = 'desc';
    else if (sort === 'rating_asc') orderBy.rating = 'asc';
    else if (sort === 'title') orderBy.movie = { title: 'asc' };
    else if (sort === 'oldest') orderBy.createdAt = 'asc';
    else if (sort === 'type') orderBy.movie = { type: 'asc' };
    else orderBy.createdAt = 'desc'; // newest first (default)

    const entries = await prisma.entry.findMany({
      where,
      orderBy,
      include: {
        movie: {
          include: {
            genres: {
              include: { genre: true },
            },
          },
        },
      },
    });

    return entries;
  }

  async getEntry(userId: string, entryId: string) {
    const entry = await prisma.entry.findFirst({
      where: { id: entryId, userId },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    return entry;
  }

  async createEntry(input: CreateEntryInput) {
    const { userId, movieData, rating, review, status, watchedDate } = input;

    // Find or create the movie record
    // "upsert" means: update if exists, insert if not
    const movie = await prisma.movie.upsert({
      where: { tmdbId: movieData.tmdbId },
      update: {}, // don't update existing movie data
      create: {
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        type: movieData.type,
        posterUrl: movieData.posterUrl,
        backdropUrl: movieData.backdropUrl,
        overview: movieData.overview,
        releaseYear: movieData.releaseYear,
        runtime: movieData.runtime,
        director: movieData.director,
        tmdbRating: movieData.tmdbRating,
      },
    });

    // Handle genres if provided
    if (movieData.genres && movieData.genres.length > 0) {
      for (const genreName of movieData.genres) {
        const genre = await prisma.genre.upsert({
          where: { name: genreName },
          update: {},
          create: { name: genreName },
        });

        // Connect genre to movie (ignore if already connected)
        await prisma.movieGenre.upsert({
          where: {
            movieId_genreId: {
              movieId: movie.id,
              genreId: genre.id,
            },
          },
          update: {},
          create: {
            movieId: movie.id,
            genreId: genre.id,
          },
        });
      }
    }

    // Check if user already has this movie in their collection
    const existingEntry = await prisma.entry.findUnique({
      where: {
        userId_movieId: { userId, movieId: movie.id },
      },
    });

    if (existingEntry) {
      throw new Error('This title is already in your collection');
    }

    // Create the entry
    const entry = await prisma.entry.create({
      data: {
        userId,
        movieId: movie.id,
        rating,
        review,
        status,
        watchedDate: watchedDate ? new Date(watchedDate) : null,
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });

    return entry;
  }

  async updateEntry(userId: string, entryId: string, input: UpdateEntryInput) {
    // First verify this entry belongs to this user
    const existing = await prisma.entry.findFirst({
      where: { id: entryId, userId },
    });

    if (!existing) {
      throw new Error('Entry not found');
    }

    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.review !== undefined && { review: input.review }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.rewatchCount !== undefined && { rewatchCount: input.rewatchCount }),
        ...(input.watchedDate !== undefined && {
          watchedDate: input.watchedDate ? new Date(input.watchedDate) : null,
        }),
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });

    return entry;
  }

  async deleteEntry(userId: string, entryId: string) {
    const existing = await prisma.entry.findFirst({
      where: { id: entryId, userId },
    });

    if (!existing) {
      throw new Error('Entry not found');
    }

    await prisma.entry.delete({ where: { id: entryId } });
    return { message: 'Entry removed from collection' };
  }

  async getStats(userId: string) {
    const entries = await prisma.entry.findMany({
      where: { userId },
      include: { movie: true },
    });

    const watched = entries.filter(e => e.status === 'WATCHED');
    const movies = watched.filter(e => e.movie.type === 'MOVIE');
    const tvShows = watched.filter(e => e.movie.type === 'TV_SHOW');

    const ratings = watched
      .filter(e => e.rating !== null)
      .map(e => e.rating as number);

    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    return {
      totalWatched: watched.length,
      moviesWatched: movies.length,
      tvShowsWatched: tvShows.length,
      averageRating,
      planToWatch: entries.filter(e => e.status === 'PLAN_TO_WATCH').length,
      watching: entries.filter(e => e.status === 'WATCHING').length,
      dropped: entries.filter(e => e.status === 'DROPPED').length,
    };
  }
}

export const entriesService = new EntriesService();