import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const createChallanSchema = z.object({
  customerId: z.string().min(1),
  status: z.enum(['Draft', 'Confirmed']),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
});

export async function createChallan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { customerId, status, items } = createChallanSchema.parse(req.body);

    const challan = await prisma.$transaction(async (tx) => {
      const challanNumber = `CH-${Date.now()}`;
      let totalQuantity = 0;
      const challanItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new AppError(404, `Product ${item.productId} not found`);

        if (status === 'Confirmed' && product.currentStock < item.quantity) {
          throw new AppError(
            409,
            `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`
          );
        }

        totalQuantity += item.quantity;
        challanItemsData.push({
          productId: product.id,
          productNameSnapshot: product.name,
          productSkuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
        });

        if (status === 'Confirmed') {
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: -item.quantity,
              type: 'OUT',
              reason: `Challan ${challanNumber}`,
              createdById: req.user!.userId,
            },
          });
        }
      }

      return tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status,
          createdById: req.user!.userId,
          items: { create: challanItemsData },
        },
        include: { items: true },
      });
    });

    res.status(201).json(challan);
  } catch (err) {
    next(err);
  }
}

export async function getChallans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const challans = await prisma.challan.findMany({
      include: { customer: true, items: true, createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(challans);
  } catch (err) {
    next(err);
  }
}

export async function updateChallanStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['Confirmed', 'Cancelled']) }).parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!challan) throw new AppError(404, 'Challan not found');
      if (challan.status !== 'Draft') throw new AppError(400, 'Only Draft challans can be updated');

      if (status === 'Confirmed') {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new AppError(404, `Product not found`);
          if (product.currentStock < item.quantity) {
            throw new AppError(
              409,
              `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: -item.quantity,
              type: 'OUT',
              reason: `Confirmed Challan ${challan.challanNumber}`,
              createdById: req.user!.userId,
            },
          });
        }
      }

      return tx.challan.update({
        where: { id },
        data: { status },
      });
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}