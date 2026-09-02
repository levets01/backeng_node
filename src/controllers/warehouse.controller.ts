
import { Response } from 'express';
import { AuthRequest, CreateWarehouseDTO } from '../types';
import { warehouseService } from '../services/warehouse.service';

/**
 * Retrieves all active warehouses.
 *
 * @param _req - Express authenticated request.
 * @param res - Express response used to return the warehouses.
 * @returns A promise that resolves when the operation is completed.
 */
export const getWarehouses = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    res.status(200).json(warehouses);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener almacenes';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Retrieves an active warehouse by its ID.
 *
 * @param req - Express authenticated request containing the warehouse ID.
 * @param res - Express response used to return the warehouse.
 * @returns A promise that resolves when the operation is completed.
 */
export const getWarehouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.getWarehouseById(Number(id));
    res.status(200).json(warehouse);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener almacén';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Creates a new warehouse.
 *
 * Validates that the specified responsible user exists and is active.
 *
 * @param req - Express authenticated request containing the warehouse data.
 * @param res - Express response used to return the created warehouse.
 * @returns A promise that resolves when the operation is completed.
 */
export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body as CreateWarehouseDTO);
    res.status(201).json({ message: 'Almacén creado exitosamente', warehouse });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al crear almacén';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Updates an existing warehouse.
 *
 * @param req - Express authenticated request containing the warehouse ID and updated data.
 * @param res - Express response used to return the updated warehouse.
 * @returns A promise that resolves when the operation is completed.
 */
export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.updateWarehouse(Number(id), req.body);
    res.status(200).json({ message: 'Almacén actualizado exitosamente', warehouse });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al actualizar almacén';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Soft-deletes an existing warehouse by setting its active status to false.
 *
 * @param req - Express authenticated request containing the warehouse ID.
 * @param res - Express response used to return the operation result.
 * @returns A promise that resolves when the operation is completed.
 */

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await warehouseService.deleteWarehouse(Number(id));
    res.status(200).json({ message: 'Almacén eliminado exitosamente' });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al eliminar almacén';
    res.status(status).json({ message, error: error?.message });
  }
}