import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de validación de datos de entrada.
 * Verifica que los campos requeridos estén presentes en el body.
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      res.status(400).json({
        message: 'Faltan campos obligatorios',
        missingFields,
      });
      return;
    }

    next();
  };
};

/**
 * Valida que un valor sea un número entero positivo.
 */
export const validatePositiveInteger = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[fieldName];

    if (value !== undefined && value !== null) {
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
        res.status(400).json({
          message: `El campo "${fieldName}" debe ser un número entero positivo`,
        });
        return;
      }
    }

    next();
  };
};

/**
 * Valida que el NIT no esté duplicado.
 */
export const validateUniqueNIT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { nit } = req.body;
  if (nit) {
    const Clinic = (await import('../models/Clinic')).default;
    const existing = await Clinic.findOne({ where: { nit } });
    if (existing) {
      res.status(400).json({ message: 'Ya existe una clínica con ese NIT' });
      return;
    }
  }
  next();
};
