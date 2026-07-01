import { Router } from 'express';
import { entriesController } from '../controllers/entries.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', entriesController.getEntries);
router.post('/', entriesController.createEntry);
router.get('/stats', entriesController.getStats);
router.get('/:id', entriesController.getEntry);
router.put('/:id', entriesController.updateEntry);
router.delete('/:id', entriesController.deleteEntry);

export default router;