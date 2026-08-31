
import { Response } from 'express';
import Medication from '../models/Medication';
import WarehouseMedication from '../models/WarehouseMedication';
import Warehouse from '../models/Warehouse';
import { AuthRequest, CreateMedicationDTO, AssignStockDTO } from '../types';

/**
 * Retrieves all active medications.
 *
 * @param _req - Express authenticated request.
 * @param res - Express response used to return the medications.
 * @returns A promise that resolves when the operation is completed.
 */
export const getMedications = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medications = await Medication.findAll({ where: { isActive: true } });
    res.status(200).json(medications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener medicamentos', error: (error as Error).message });
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
    const medication = await Medication.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: WarehouseMedication,
          as: 'stocks',
          where: { isActive: true },
          required: false,
          include: [{ model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] }],
        },
      ],
    });
    if (!medication) {
      res.status(404).json({ message: 'Medicamento no encontrado' });
      return;
    }
    res.status(200).json(medication);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener medicamento', error: (error as Error).message });
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
    const { name, description, unitPrice } = req.body as CreateMedicationDTO;
    const medication = await Medication.create({ name, description, unitPrice });
    res.status(201).json({ message: 'Medicamento creado exitosamente', medication });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear medicamento', error: (error as Error).message });
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
    const medication = await Medication.findOne({ where: { id, isActive: true } });
    if (!medication) {
      res.status(404).json({ message: 'Medicamento no encontrado' });
      return;
    }
    await medication.update(req.body);
    res.status(200).json({ message: 'Medicamento actualizado exitosamente', medication });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar medicamento', error: (error as Error).message });
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
    const medication = await Medication.findOne({ where: { id, isActive: true } });
    if (!medication) {
      res.status(404).json({ message: 'Medicamento no encontrado' });
      return;
    }
    await medication.update({ isActive: false });
    res.status(200).json({ message: 'Medicamento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar medicamento', error: (error as Error).message });
  }
};

/**
 * Assigns medication stock to a warehouse.
 *
 * Creates a new warehouse-medication stock record if one does not exist,
 * or updates the existing stock quantity.
 *
 * @param req - Express authenticated request containing the warehouse, medication, and stock data.
 * @param res - Express response used to return the stock assignment result.
 * @returns A promise that resolves when the operation is completed.
 */
export const assignStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId, medicationId, stock } = req.body as AssignStockDTO;

    if (stock < 0) {
      res.status(400).json({ message: 'El stock no puede ser negativo' });
      return;
    }

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      res.status(404).json({ message: 'Almacén no encontrado' });
      return;
    }

    const medication = await Medication.findOne({ where: { id: medicationId, isActive: true } });
    if (!medication) {
      res.status(404).json({ message: 'Medicamento no encontrado' });
      return;
    }

    const [existingStock, created] = await WarehouseMedication.findOrCreate({
      where: { warehouseId, medicationId },
      defaults: { warehouseId, medicationId, stock },
    });

    if (!created) {
      await existingStock.update({ stock });
    }

    res.status(200).json({ message: 'Stock asignado exitosamente', warehouseMedication: existingStock });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar stock', error: (error as Error).message });
  }
};

