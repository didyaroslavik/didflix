import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        shareToken: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    (req as any).user = user;
    next(); // pass control to the next handler
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}