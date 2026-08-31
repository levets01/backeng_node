
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware for validating required input fields.
 *
 * Checks whether the specified fields are present and have valid values
 * in the request body.
 *
 * @param fields - List of required field names.
 * @returns Express middleware that validates the required fields.
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
 * Validates that a field contains a positive integer.
 *
 * @param fieldName - Name of the field to validate.
 * @returns Express middleware that validates the specified field.
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
 * Validates that the NIT is unique.
 *
 * Checks whether a clinic with the specified NIT already exists.
 *
 * @param req - Express request containing the NIT in the request body.
 * @param res - Express response used to return validation errors.
 * @param next - Callback that passes control to the next middleware.
 * @returns A promise that resolves when the validation is completed.
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

