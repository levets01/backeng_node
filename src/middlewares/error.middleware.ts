
import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware.
 *
 * Logs unhandled errors and returns a standardized internal server error response.
 *
 * @param err - Error object containing information about the failure.
 * @param _req - Express request object.
 * @param res - Express response used to return the error response.
 * @param _next - Callback for passing control to the next middleware.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error no controlado:', err.message);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

/**
 * Middleware for handling requests to undefined routes.
 *
 * @param _req - Express request object.
 * @param res - Express response used to return the not found response.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};

