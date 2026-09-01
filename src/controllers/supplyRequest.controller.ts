import { Response } from 'express';
import { AuthRequest, CreateSupplyRequestDTO, UpdateRequestStatusDTO } from '../types';
import { supplyRequestService } from '../services/supplyRequest.service';

/**
 * Retrieves all active supply requests.
 *
 * @param _req - Express authenticated request.
 * @param res - Express response used to return the supply requests.
 * @returns A promise that resolves when the operation is completed.
 */
export const getSupplyRequests = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await supplyRequestService.getAllRequests();
    res.status(200).json(requests);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener solicitudes';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Retrieves an active supply request by its ID.
 *
 * @param req - Express authenticated request containing the request ID.
 * @param res - Express response used to return the supply request.
 * @returns A promise that resolves when the operation is completed.
 */
export const getSupplyRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await supplyRequestService.getRequestById(Number(id));
    res.status(200).json(request);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener solicitud';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Creates a new supply request.
 *
 * Validates the existence of the clinic, medication, and warehouse,
 * as well as the availability of the requested stock.
 *
 * @param req - Express authenticated request containing the supply request data.
 * @param res - Express response used to return the created request.
 * @returns A promise that resolves when the operation is completed.
 */
export const createSupplyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const supplyRequest = await supplyRequestService.createRequest(
      req.body as CreateSupplyRequestDTO,
      userId
    );
    res.status(201).json({ message: 'Solicitud creada exitosamente', supplyRequest });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al crear solicitud';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Updates the status of an existing supply request.
 *
 * Validates that the requested status transition is allowed
 * according to the defined request workflow.
 *
 * @param req - Express authenticated request containing the request ID and new status.
 * @param res - Express response used to return the updated request.
 * @returns A promise that resolves when the operation is completed.
 */
export const updateSupplyRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body as UpdateRequestStatusDTO;
    const supplyRequest = await supplyRequestService.updateRequestStatus(Number(id), newStatus);
    res.status(200).json({ message: 'Estado actualizado exitosamente', supplyRequest });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al actualizar estado';
    res.status(status).json({
      message,
      error: error?.message,
      allowedTransitions: error?.allowedTransitions,
    });
  }
};

/**
 * Retrieves the supply request history for an active clinic.
 *
 * @param req - Express authenticated request containing the clinic ID.
 * @param res - Express response used to return the clinic and its request history.
 * @returns A promise that resolves when the operation is completed.
 */
export const getRequestHistoryByClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const result = await supplyRequestService.getRequestHistoryByClinic(Number(clinicId));
    res.status(200).json(result);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener historial';
    res.status(status).json({ message, error: error?.message });
  }
};

/**
 * Soft-deletes an existing supply request by setting its active status to false.
 *
 * @param req - Express authenticated request containing the request ID.
 * @param res - Express response used to return the operation result.
 * @returns A promise that resolves when the operation is completed.
 */
export const deleteSupplyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await supplyRequestService.deleteRequest(Number(id));
    res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al eliminar solicitud';
    res.status(status).json({ message, error: error?.message });
  }
};
