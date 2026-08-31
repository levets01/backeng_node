import { Response } from 'express';
import Clinic from '../models/Clinic';
import User from '../models/User';
import { AuthRequest, CreateClinicDTO } from '../types';

/**
 * Obtiene todas las clínicas activas.
 */
export const getClinics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clinics = await Clinic.findAll({
      where: { isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    res.status(200).json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clínicas', error: (error as Error).message });
  }
};

/**
 * Obtiene una clínica por ID.
 */
export const getClinicById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({
      where: { id, isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    if (!clinic) {
      res.status(404).json({ message: 'Clínica no encontrada' });
      return;
    }
    res.status(200).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clínica', error: (error as Error).message });
  }
};

/**
 * Crea una nueva clínica.
 * Valida que no exista otra clínica con el mismo NIT.
 */
export const createClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, nit, address, phone, responsibleId } = req.body as CreateClinicDTO;

    const existingClinic = await Clinic.findOne({ where: { nit } });
    if (existingClinic) {
      res.status(400).json({ message: 'Ya existe una clínica con ese NIT' });
      return;
    }

    const responsible = await User.findOne({ where: { id: responsibleId, isActive: true } });
    if (!responsible) {
      res.status(400).json({ message: 'El responsable especificado no existe' });
      return;
    }

    const clinic = await Clinic.create({ name, nit, address, phone, responsibleId });
    res.status(201).json({ message: 'Clínica creada exitosamente', clinic });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear clínica', error: (error as Error).message });
  }
};

/**
 * Actualiza una clínica existente.
 */
export const updateClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });
    if (!clinic) {
      res.status(404).json({ message: 'Clínica no encontrada' });
      return;
    }

    const { nit } = req.body as CreateClinicDTO;
    if (nit && nit !== clinic.nit) {
      const existingClinic = await Clinic.findOne({ where: { nit } });
      if (existingClinic) {
        res.status(400).json({ message: 'Ya existe una clínica con ese NIT' });
        return;
      }
    }

    await clinic.update(req.body);
    res.status(200).json({ message: 'Clínica actualizada exitosamente', clinic });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar clínica', error: (error as Error).message });
  }
};

/**
 * Elimina lógicamente una clínica (marca isActive = false).
 */
export const deleteClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });
    if (!clinic) {
      res.status(404).json({ message: 'Clínica no encontrada' });
      return;
    }
    await clinic.update({ isActive: false });
    res.status(200).json({ message: 'Clínica eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar clínica', error: (error as Error).message });
  }
};
