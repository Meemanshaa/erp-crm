import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.number().positive(),
  currentStock: z.number().int().min(0).optional(),
  minStockAlert: z.number().int().min(0).optional(),
  location: z.string().min(1),
});

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function adjustStock(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { quantityChanged, reason, type } = z.object({
      quantityChanged: z.number().int(),
      reason: z.string().min(1),
      type: z.enum(['IN', 'OUT']),
    }).parse(req.body);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new AppError(404, 'Product not found');

      const delta = type === 'IN' ? Math.abs(quantityChanged) : -Math.abs(quantityChanged);
      const newStock = product.currentStock + delta;
      if (newStock < 0) throw new AppError(409, 'Stock cannot be negative');

      await tx.stockMovement.create({
        data: {
          productId: id,
          quantityChanged: delta,
          type,
          reason,
          createdById: req.user!.userId,
        },
      });

      return tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });
    });

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = productSchema.partial().parse(req.body);
    const updated = await prisma.product.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getProductMovements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movements);
  } catch (err) {
    next(err);
  }
}