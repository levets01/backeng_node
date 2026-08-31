import { Response } from 'express';
import User from '../models/User';
import Clinic from '../models/Clinic';
import Warehouse from '../models/Warehouse';
import Medication from '../models/Medication';
import WarehouseMedication from '../models/WarehouseMedication';
import SupplyRequest from '../models/SupplyRequest';
import { AuthRequest, SeederPayload, CreateClinicDTO, CreateWarehouseDTO, CreateMedicationDTO } from '../types';

/**
 * Endpoint semillero: carga datos iniciales desde un archivo JSON.
 * Recibe un archivo JSON con arrays de usuarios, clínicas, almacenes, medicamentos, stocks y solicitudes.
 */
export const seedData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se proporcionó ningún archivo JSON' });
      return;
    }

    const rawData = JSON.parse(req.file.buffer.toString('utf-8')) as SeederPayload;
    const results: Record<string, string> = {};

    if (rawData.users && Array.isArray(rawData.users)) {
      const createdUsers: Array<{ id: number; name: string; email: string; role: string }> = [];
      for (const userData of rawData.users) {
        const [user, created] = await User.findOrCreate({
          where: { email: userData.email },
          defaults: {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'gestor',
          },
        });
        if (created) {
          createdUsers.push({ id: user.id, name: user.name, email: user.email, role: user.role });
        }
      }
      results.users = `Usuarios procesados: ${createdUsers.length} nuevos de ${rawData.users.length}`;
    }

    if (rawData.clinics && Array.isArray(rawData.clinics)) {
      let count = 0;
      for (const clinicData of rawData.clinics) {
        const existing = await Clinic.findOne({ where: { nit: clinicData.nit } });
        if (!existing) {
          await Clinic.create(clinicData as any);
          count++;
        }
      }
      results.clinics = `Clínicas procesadas: ${count} nuevas de ${rawData.clinics.length}`;
    }

    if (rawData.warehouses && Array.isArray(rawData.warehouses)) {
      let count = 0;
      for (const warehouseData of rawData.warehouses) {
        const existing = await Warehouse.findOne({ where: { name: warehouseData.name } });
        if (!existing) {
          await Warehouse.create(warehouseData as any);
          count++;
        }
      }
      results.warehouses = `Almacenes procesados: ${count} nuevos de ${rawData.warehouses.length}`;
    }

    if (rawData.medications && Array.isArray(rawData.medications)) {
      let count = 0;
      for (const medData of rawData.medications) {
        const existing = await Medication.findOne({ where: { name: medData.name } });
        if (!existing) {
          await Medication.create(medData as any);
          count++;
        }
      }
      results.medications = `Medicamentos procesados: ${count} nuevos de ${rawData.medications.length}`;
    }

    if (rawData.stocks && Array.isArray(rawData.stocks)) {
      let count = 0;
      for (const stockData of rawData.stocks) {
        const [record, created] = await WarehouseMedication.findOrCreate({
          where: { warehouseId: stockData.warehouseId, medicationId: stockData.medicationId },
          defaults: {
            warehouseId: stockData.warehouseId,
            medicationId: stockData.medicationId,
            stock: stockData.stock,
          },
        });
        if (!created) {
          await record.update({ stock: stockData.stock });
        }
        count++;
      }
      results.stocks = `Stocks procesados: ${count} registros`;
    }

    if (rawData.supplyRequests && Array.isArray(rawData.supplyRequests)) {
      let count = 0;
      for (const reqData of rawData.supplyRequests) {
        await SupplyRequest.create({
          ...reqData,
          requestedById: req.user!.id,
          status: 'pendiente',
        });
        count++;
      }
      results.supplyRequests = `Solicitudes procesadas: ${count} nuevas`;
    }

    res.status(201).json({ message: 'Datos cargados exitosamente', results });
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar datos', error: (error as Error).message });
  }
};
