import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { tmdbService } from '../services/tmdb.service';

const router = Router();

router.use(requireAuth);

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      res.status(400).json({ error: 'Query must be at least 2 characters' });
      return;
    }
    const results = await tmdbService.search(query);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type !== 'movie' && type !== 'tv') {
      res.status(400).json({ error: 'Type must be movie or tv' });
      return;
    }
    const details = await tmdbService.getDetails(parseInt(id), type);
    res.json({ details });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;