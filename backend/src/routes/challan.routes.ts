import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createChallan, getChallans, updateChallanStatus } from '../controllers/challan.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getChallans);
router.post('/', requireRole(['Sales', 'Admin']), createChallan);
router.patch('/:id/status', requireRole(['Sales', 'Admin']), updateChallanStatus);

export default router;