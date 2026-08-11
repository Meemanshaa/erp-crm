import { Request, Response, NextFunction } from 'express';

// Put this AFTER requireAuth on any route that only certain roles can use.
// Usage: router.post('/products', requireAuth, requireRole(['Admin', 'Warehouse']), controllerFn)
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}
