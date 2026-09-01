import Medication from '../models/Medication';
import WarehouseMedication from '../models/WarehouseMedication';
import Warehouse from '../models/Warehouse';

/**
 * Medication Repository
 * Encapsulates all database operations related to medications
 */
export const medicationRepository = {
  /**
   * Retrieves all active medications
   * @returns Promise with list of medications
   */
  async findAll() {
    return Medication.findAll({ where: { isActive: true } });
  },

  /**
   * Retrieves a specific medication by ID with its warehouse stock
   * @param id - Medication ID
   * @returns Promise with medication and its stock in different warehouses
   */
  async findById(id: number) {
    return Medication.findOne({
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
  },

  /**
   * Creates a new medication in the database
   * @param data - Object with medication data (name, description, unitPrice)
   * @returns Promise with created medication
   */
  async create(data: any) {
    return Medication.create(data);
  },

  /**
   * Updates an existing medication
   * @param id - Medication ID to update
   * @param data - Object with data to update
   * @returns Promise with updated medication or null if not found
   */
  async update(id: number, data: any) {
    const medication = await Medication.findOne({ where: { id, isActive: true } });
    if (!medication) return null;
    return medication.update(data);
  },

  /**
   * Soft deletes an existing medication
   * Marks the medication as inactive without physically removing it from the database
   * @param id - Medication ID to delete
   * @returns Promise with deleted medication or null if not found
   */
  async delete(id: number) {
    const medication = await Medication.findOne({ where: { id, isActive: true } });
    if (!medication) return null;
    return medication.update({ isActive: false });
  },
};
