import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/u/:token', async (req, res) => {
  try {
    const token = req.params.token as string;

    const user = await prisma.user.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        viewCount: true,
        likesReceived: true,
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

    await prisma.user.update({
      where: { shareToken: token },
      data: { viewCount: { increment: 1 } },
    });

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
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        memberSince: user.createdAt,
        viewCount: user.viewCount + 1,
        likeCount: user.likesReceived.length,
      },
      stats,
      entries: user.entries,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
        viewCount: true,
        likesReceived: true,
        _count: { select: { entries: true } },
      },
      take: 10,
    });

    res.json({
      users: users.map(u => ({
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        shareToken: u.shareToken,
        viewCount: u.viewCount,
        likeCount: u.likesReceived.length,
        _count: u._count,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/u/:token/like', requireAuth, async (req, res) => {
  try {
    const token = req.params.token as string;
    const fromUserId = (req as any).user.id;

    const targetUser = await prisma.user.findUnique({
      where: { shareToken: token },
      select: { id: true },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    if (targetUser.id === fromUserId) {
      res.status(400).json({ error: 'You cannot like your own profile' });
      return;
    }

    const existing = await prisma.profileLike.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId: targetUser.id,
        },
      },
    });

    if (existing) {
      await prisma.profileLike.delete({
        where: {
          fromUserId_toUserId: {
            fromUserId,
            toUserId: targetUser.id,
          },
        },
      });
      const likeCount = await prisma.profileLike.count({
        where: { toUserId: targetUser.id },
      });
      res.json({ liked: false, likeCount });
    } else {
      await prisma.profileLike.create({
        data: { fromUserId, toUserId: targetUser.id },
      });
      const likeCount = await prisma.profileLike.count({
        where: { toUserId: targetUser.id },
      });
      res.json({ liked: true, likeCount });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/u/:token/liked', requireAuth, async (req, res) => {
  try {
    const token = req.params.token as string;
    const fromUserId = (req as any).user.id;

    const targetUser = await prisma.user.findUnique({
      where: { shareToken: token },
      select: { id: true },
    });

    if (!targetUser) {
      res.status(404).json({ liked: false });
      return;
    }

    const existing = await prisma.profileLike.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId: targetUser.id,
        },
      },
    });

    res.json({ liked: !!existing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;