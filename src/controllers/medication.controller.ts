import { Response } from 'express';
import Medication from '../models/Medication';
import WarehouseMedication from '../models/WarehouseMedication';
import Warehouse from '../models/Warehouse';
import { AuthRequest, CreateMedicationDTO, AssignStockDTO } from '../types';

/**
 * Obtiene todos los medicamentos activos.
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
 * Obtiene un medicamento por ID con su stock en almacenes.
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
 * Crea un nuevo medicamento.
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
 * Actualiza un medicamento existente.
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
 * Elimina lógicamente un medicamento.
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
 * Asigna stock de un medicamento a un almacén.
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
