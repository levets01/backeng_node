import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de manejo de errores.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error no controlado:', err.message);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

/**
 * Middleware para rutas no encontradas.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};
