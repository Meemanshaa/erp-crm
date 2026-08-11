import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createProduct, getProducts, updateProduct, adjustStock, getProductMovements } from '../controllers/product.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getProducts);
router.post('/', requireRole(['Admin', 'Warehouse']), createProduct);
router.put('/:id', requireRole(['Admin', 'Warehouse']), updateProduct);
router.post('/:id/stock', requireRole(['Admin', 'Warehouse']), adjustStock);
router.get('/:id/movements', getProductMovements);

export default router;