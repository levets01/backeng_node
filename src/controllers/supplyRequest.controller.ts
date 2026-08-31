import { Response } from 'express';
import SupplyRequest from '../models/SupplyRequest';
import Clinic from '../models/Clinic';
import Warehouse from '../models/Warehouse';
import Medication from '../models/Medication';
import WarehouseMedication from '../models/WarehouseMedication';
import User from '../models/User';
import { AuthRequest, CreateSupplyRequestDTO, UpdateRequestStatusDTO, RequestStatus } from '../types';

const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pendiente: ['en_proceso', 'cancelada'],
  en_proceso: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

/** * Retrieves all active supply requests. *
 *  * @param _req - Express authenticated request. 
 * * @param res - Express response used to return the supply requests. 
 * * @returns A promise that resolves when the operation is completed. */



export const getSupplyRequests = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await SupplyRequest.findAll({
      where: { isActive: true },
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name', 'nit'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] },
        { model: Medication, as: 'medication', attributes: ['id', 'name', 'unitPrice'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes', error: (error as Error).message });
  }
};

/** * Retrieves an active supply request by its ID. * 
 * * @param req - Express authenticated request containing the request ID. 
 * * @param res - Express response used to return the supply request. 
 * * @returns A promise that resolves when the operation is completed. */





export const getSupplyRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await SupplyRequest.findOne({
      where: { id, isActive: true },
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name', 'nit'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] },
        { model: Medication, as: 'medication', attributes: ['id', 'name', 'unitPrice'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!request) {
      res.status(404).json({ message: 'Solicitud no encontrada' });
      return;
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitud', error: (error as Error).message });
  }
};



/** * Creates a new supply request. *
 *  * Validates the existence of the clinic, medication, and warehouse, 
 * * as well as the availability of the requested stock. * 
 * * @param req - Express authenticated request containing the supply request data. 
 * * @param res - Express response used to return the created request. 
 * * @returns A promise that resolves when the operation is completed. */




export const createSupplyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clinicId, medicationId, quantity, warehouseId } = req.body as CreateSupplyRequestDTO;
    const userId = req.user!.id;

    if (quantity <= 0) {
      res.status(400).json({ message: 'La cantidad debe ser mayor a cero' });
      return;
    }

    const clinic = await Clinic.findOne({ where: { id: clinicId, isActive: true } });
    if (!clinic) {
      res.status(404).json({ message: 'Clínica no encontrada' });
      return;
    }

    const medication = await Medication.findOne({ where: { id: medicationId, isActive: true } });
    if (!medication) {
      res.status(404).json({ message: 'Medicamento no encontrado' });
      return;
    }

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      res.status(404).json({ message: 'Almacén no encontrado' });
      return;
    }

    const stockRecord = await WarehouseMedication.findOne({
      where: { warehouseId, medicationId, isActive: true },
    });

    if (!stockRecord || stockRecord.stock < quantity) {
      const available = stockRecord ? stockRecord.stock : 0;
      res.status(400).json({
        message: `Stock insuficiente. Disponible: ${available}, Solicitado: ${quantity}`,
      });
      return;
    }

    await stockRecord.update({ stock: stockRecord.stock - quantity });

    const supplyRequest = await SupplyRequest.create({
      clinicId,
      medicationId,
      quantity,
      warehouseId,
      requestedById: userId,
      status: 'pendiente',
    });

    res.status(201).json({ message: 'Solicitud creada exitosamente', supplyRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear solicitud', error: (error as Error).message });
  }
};


/** * Updates the status of an existing supply request. * 
 * * Validates that the requested status transition is allowed 
 * * according to the defined request workflow. * 
 * * @param req - Express authenticated request containing the request ID and new status. 
 * * @param res - Express response used to return the updated request. 
 * * @returns A promise that resolves when the operation is completed. */



export const updateSupplyRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body as UpdateRequestStatusDTO;

    const supplyRequest = await SupplyRequest.findOne({ where: { id, isActive: true } });
    if (!supplyRequest) {
      res.status(404).json({ message: 'Solicitud no encontrada' });
      return;
    }

    const allowedTransitions = VALID_TRANSITIONS[supplyRequest.status];
    if (!allowedTransitions.includes(newStatus)) {
      res.status(400).json({
        message: `No se puede cambiar de estado "${supplyRequest.status}" a "${newStatus}"`,
        allowedTransitions,
      });
      return;
    }

    await supplyRequest.update({ status: newStatus });
    res.status(200).json({ message: 'Estado actualizado exitosamente', supplyRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error: (error as Error).message });
  }
};

/** * Retrieves the supply request history for an active clinic. * 
 * * @param req - Express authenticated request containing the clinic ID. 
 * * @param res - Express response used to return the clinic and its request history.
 *  * @returns A promise that resolves when the operation is completed. */

export const getRequestHistoryByClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clinicId } = req.params;

    const clinic = await Clinic.findOne({ where: { id: clinicId, isActive: true } });
    if (!clinic) {
      res.status(404).json({ message: 'Clínica no encontrada' });
      return;
    }

    const requests = await SupplyRequest.findAll({
      where: { clinicId, isActive: true },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] },
        { model: Medication, as: 'medication', attributes: ['id', 'name', 'unitPrice'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ clinic: { id: clinic.id, name: clinic.name, nit: clinic.nit }, requests });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: (error as Error).message });
  }
};

/** * Soft-deletes an existing supply request by setting its active status to false. * * @param req - Express authenticated request containing the request ID. 
 * * @param res - Express response used to return the operation result.
 *  * @returns A promise that resolves when the operation is completed. */



export const deleteSupplyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplyRequest = await SupplyRequest.findOne({ where: { id, isActive: true } });
    if (!supplyRequest) {
      res.status(404).json({ message: 'Solicitud no encontrada' });
      return;
    }
    await supplyRequest.update({ isActive: false });
    res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar solicitud', error: (error as Error).message });
  }
};
