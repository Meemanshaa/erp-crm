import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createCustomer, getCustomers, getCustomerById, updateCustomer, addNote } from '../controllers/customer.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', requireRole(['Admin', 'Sales']), createCustomer);
router.put('/:id', requireRole(['Admin', 'Sales']), updateCustomer);
router.post('/:id/notes', requireRole(['Admin', 'Sales']), addNote);

export default router;