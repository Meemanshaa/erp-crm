import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional(),
  type: z.enum(['Retail', 'Wholesale', 'Distributor']),
  address: z.string().min(1),
  status: z.enum(['Lead', 'Active', 'Inactive']).optional(),
});

export async function createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
}

export async function getCustomers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const search = (req.query.search as string) || '';
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { businessName: { contains: search } },
          { mobile: { contains: search } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (err) {
    next(err);
  }
}

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { note } = z.object({ note: z.string().min(1) }).parse(req.body);

    const noteRecord = await prisma.followUpNote.create({
      data: {
        customerId: id,
        note,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { name: true } } }
    });
    res.status(201).json(noteRecord);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = customerSchema.partial().parse(req.body);
    const updated = await prisma.customer.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}