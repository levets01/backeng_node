
import { Response } from 'express';
import { AuthRequest, CreateMedicationDTO } from '../types';
import { medicationService } from '../services/medication.service';

/**
 * Retrieves all active medications.
 *
 * @param _req - Express authenticated request.
 * @param res - Express response used to return the medications.
 * @returns A promise that resolves when the operation is completed.
 */
export const getMedications = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medications = await medicationService.getAllMedications();
    res.status(200).json(medications);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener medicamentos';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Retrieves an active medication by ID, including its warehouse stock.
 *
 * @param req - Express authenticated request containing the medication ID.
 * @param res - Express response used to return the medication details.
 * @returns A promise that resolves when the operation is completed.
 */
export const getMedicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const medication = await medicationService.getMedicationById(Number(id));
    res.status(200).json(medication);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener medicamento';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Creates a new medication.
 *
 * @param req - Express authenticated request containing the medication data.
 * @param res - Express response used to return the created medication.
 * @returns A promise that resolves when the operation is completed.
 */
export const createMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medication = await medicationService.createMedication(req.body as CreateMedicationDTO);
    res.status(201).json({ message: 'Medicamento creado exitosamente', medication });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al crear medicamento';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Updates an existing medication.
 *
 * @param req - Express authenticated request containing the medication ID and updated data.
 * @param res - Express response used to return the updated medication.
 * @returns A promise that resolves when the operation is completed.
 */
export const updateMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const medication = await medicationService.updateMedication(Number(id), req.body);
    res.status(200).json({ message: 'Medicamento actualizado exitosamente', medication });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al actualizar medicamento';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Soft-deletes an existing medication by setting its active status to false.
 *
 * @param req - Express authenticated request containing the medication ID.
 * @param res - Express response used to return the operation result.
 * @returns A promise that resolves when the operation is completed.
 */
export const deleteMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await medicationService.deleteMedication(Number(id));
    res.status(200).json({ message: 'Medicamento eliminado exitosamente' });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al eliminar medicamento';
    res.status(status).json({ message, error: error?.message });
  }
};

