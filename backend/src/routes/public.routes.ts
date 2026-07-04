import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get public profile by share token
router.get('/u/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        entries: {
          include: {
            movie: {
              include: {
                genres: { include: { genre: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Calculate stats from entries
    const watched = user.entries.filter(e => e.status === 'WATCHED');
    const ratings = watched
      .filter(e => e.rating !== null)
      .map(e => e.rating as number);

    const stats = {
      totalWatched: watched.length,
      moviesWatched: watched.filter(e => e.movie.type === 'MOVIE').length,
      tvShowsWatched: watched.filter(e => e.movie.type === 'TV_SHOW').length,
      averageRating: ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null,
      totalInCollection: user.entries.length,
    };

    res.json({
      profile: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        memberSince: user.createdAt,
      },
      stats,
      entries: user.entries,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search users by username
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      res.status(400).json({ error: 'Query too short' });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query.toLowerCase(),
          mode: 'insensitive',
        },
      },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        shareToken: true,
        _count: { select: { entries: true } },
      },
      take: 10,
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;