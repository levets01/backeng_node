import { Response } from 'express';
import Warehouse from '../models/Warehouse';
import User from '../models/User';
import { AuthRequest, CreateWarehouseDTO } from '../types';

/**
 * Obtiene todos los almacenes activos.
 */
export const getWarehouses = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener almacenes', error: (error as Error).message });
  }
};

/**
 * Obtiene un almacén por ID.
 */
export const getWarehouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({
      where: { id, isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    if (!warehouse) {
      res.status(404).json({ message: 'Almacén no encontrado' });
      return;
    }
    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener almacén', error: (error as Error).message });
  }
};

/**
 * Crea un nuevo almacén.
 */
export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, responsibleId } = req.body as CreateWarehouseDTO;

    const responsible = await User.findOne({ where: { id: responsibleId, isActive: true } });
    if (!responsible) {
      res.status(400).json({ message: 'El responsable especificado no existe' });
      return;
    }

    const warehouse = await Warehouse.create({ name, location, responsibleId });
    res.status(201).json({ message: 'Almacén creado exitosamente', warehouse });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear almacén', error: (error as Error).message });
  }
};

/**
 * Actualiza un almacén existente.
 */
export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });
    if (!warehouse) {
      res.status(404).json({ message: 'Almacén no encontrado' });
      return;
    }
    await warehouse.update(req.body);
    res.status(200).json({ message: 'Almacén actualizado exitosamente', warehouse });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar almacén', error: (error as Error).message });
  }
};

/**
 * Elimina lógicamente un almacén.
 */
export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });
    if (!warehouse) {
      res.status(404).json({ message: 'Almacén no encontrado' });
      return;
    }
    await warehouse.update({ isActive: false });
    res.status(200).json({ message: 'Almacén eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar almacén', error: (error as Error).message });
  }
};
