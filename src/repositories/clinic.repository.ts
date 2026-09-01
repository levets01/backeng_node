import Clinic from '../models/Clinic';
import User from '../models/User';

/**
 * Clinic Repository
 * Encapsulates all database operations related to clinics
 */
export const clinicRepository = {
  /**
   * Retrieves all active clinics
   * @returns Promise with list of clinics including responsible user data
   */
  async findAll() {
    return Clinic.findAll({
      where: { isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
  },

  /**
   * Retrieves a specific clinic by ID
   * @param id - Clinic ID
   * @returns Promise with found clinic or null
   */
  async findById(id: number) {
    return Clinic.findOne({
      where: { id, isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
  },

  /**
   * Searches for a clinic by its NIT (Tax Identification Number)
   * @param nit - Clinic NIT
   * @returns Promise with found clinic or null
   */
  async findByNit(nit: string) {
    return Clinic.findOne({ where: { nit } });
  },

  /**
   * Creates a new clinic in the database
   * @param data - Object with clinic data (name, nit, address, phone, responsibleId)
   * @returns Promise with created clinic
   */
  async create(data: any) {
    return Clinic.create(data);
  },

  /**
   * Updates an existing clinic
   * @param id - Clinic ID to update
   * @param data - Object with data to update
   * @returns Promise with updated clinic or null if not found
   */
  async update(id: number, data: any) {
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });
    if (!clinic) return null;
    return clinic.update(data);
  },

  /**
   * Soft deletes an existing clinic
   * Marks the clinic as inactive without physically removing it from the database
   * @param id - Clinic ID to delete
   * @returns Promise with deleted clinic or null if not found
   */
  async delete(id: number) {
    const clinic = await Clinic.findOne({ where: { id, isActive: true } });
    if (!clinic) return null;
    return clinic.update({ isActive: false });
  },
};
