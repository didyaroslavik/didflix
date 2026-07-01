import { Request, Response } from 'express';
import { entriesService } from '../services/entries.service';

export class EntriesController {
  async getEntries(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { type, status, sort } = req.query as Record<string, string>;

      const entries = await entriesService.getEntries(
        userId,
        { type, status },
        sort
      );

      res.json({ entries });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      const entry = await entriesService.getEntry(userId, id);
      res.json({ entry });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { movieData, rating, review, status, watchedDate } = req.body;

      if (!movieData || !status) {
        res.status(400).json({ error: 'movieData and status are required' });
        return;
      }

      const entry = await entriesService.createEntry({
        userId,
        movieData,
        rating,
        review,
        status,
        watchedDate,
      });

      res.status(201).json({ entry });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      const entry = await entriesService.updateEntry(userId, id, req.body);
      res.json({ entry });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEntry(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id as string;

      const result = await entriesService.deleteEntry(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const stats = await entriesService.getStats(userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const entriesController = new EntriesController();