import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

/**
 * Middleware que verifica el rol del usuario.
 * @param allowedRoles - Roles permitidos para acceder al recurso
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
      return;
    }

    next();
  };
};
