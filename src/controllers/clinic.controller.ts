
import { Response } from 'express';
import { AuthRequest, CreateClinicDTO } from '../types';
import { clinicService } from '../services/clinic.service';

/**
 * Retrieves all active clinics.
 *
 * @param _req - Express authenticated request.
 * @param res - Express response used to return the clinics.
 * @returns A promise that resolves when the operation is completed.
 */
export const getClinics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clinics = await clinicService.getAllClinics();
    res.status(200).json(clinics);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener clínicas';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Retrieves an active clinic by its ID.
 *
 * @param req - Express authenticated request containing the clinic ID.
 * @param res - Express response used to return the clinic.
 * @returns A promise that resolves when the operation is completed.
 */
export const getClinicById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await clinicService.getClinicById(Number(id));
    res.status(200).json(clinic);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener clínica';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Creates a new clinic.
 *
 * Validates that no other clinic exists with the same NIT
 * and that the assigned responsible user is active.
 *
 * @param req - Express authenticated request containing clinic data.
 * @param res - Express response used to return the created clinic.
 * @returns A promise that resolves when the operation is completed.
 */
export const createClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clinic = await clinicService.createClinic(req.body as CreateClinicDTO);
    res.status(201).json({ message: 'Clínica creada exitosamente', clinic });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al crear clínica';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Updates an existing clinic.
 *
 * Validates the NIT if it is changed to ensure it is not already
 * associated with another clinic.
 *
 * @param req - Express authenticated request containing the clinic ID and updated data.
 * @param res - Express response used to return the updated clinic.
 * @returns A promise that resolves when the operation is completed.
 */
export const updateClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await clinicService.updateClinic(Number(id), req.body);
    res.status(200).json({ message: 'Clínica actualizada exitosamente', clinic });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al actualizar clínica';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Soft-deletes an existing clinic by setting its active status to false.
 *
 * @param req - Express authenticated request containing the clinic ID.
 * @param res - Express response used to return the operation result.
 * @returns A promise that resolves when the operation is completed.
 */
export const deleteClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await clinicService.deleteClinic(Number(id));
    res.status(200).json({ message: 'Clínica eliminada exitosamente' });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al eliminar clínica';
    res.status(status).json({ message, error: error?.message });
  }
};

