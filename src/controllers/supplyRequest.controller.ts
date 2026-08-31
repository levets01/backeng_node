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

/**
 * Obtiene todas las solicitudes activas.
 */
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

/**
 * Obtiene una solicitud por ID.
 */
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

/**
 * Crea una nueva solicitud de abastecimiento.
 * Valida existencia de clínica, medicamento y disponibilidad de stock.
 */
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

/**
 * Actualiza el estado de una solicitud.
 * Valida las transiciones permitidas.
 */
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

/**
 * Obtiene el historial de solicitudes de una clínica.
 */
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

/**
 * Elimina lógicamente una solicitud.
 */
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
