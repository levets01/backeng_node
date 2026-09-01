import { clinicRepository } from '../repositories/clinic.repository';
import { userRepository } from '../repositories/user.repository';
import { CreateClinicDTO } from '../types';

/**
 * Clinic Service
 * Contains business logic for clinic operations
 */
export const clinicService = {
  /**
   * Retrieves all active clinics
   * @returns Promise with list of clinics
   */
  async getAllClinics() {
    return clinicRepository.findAll();
  },

  /**
   * Retrieves a specific clinic by ID
   * @param id - Clinic ID
   * @returns Promise with clinic data
   * @throws Error if clinic not found
   */
  async getClinicById(id: number) {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw {
        status: 404,
        message: 'Clinic not found',
      };
    }
    return clinic;
  },

  /**
   * Creates a new clinic with validations
   * Validates: required fields, unique NIT, responsible user exists
   * @param data - Clinic creation data
   * @returns Promise with created clinic
   * @throws Error if validation fails
   */
  async createClinic(data: CreateClinicDTO) {
    const { name, nit, address, phone, responsibleId } = data;

    // Validate required fields
    if (!name || !nit || !responsibleId) {
      throw {
        status: 400,
        message: 'Name, NIT and responsible are required',
      };
    }

    // Validate NIT is unique
    const existingClinic = await clinicRepository.findByNit(nit);
    if (existingClinic) {
      throw {
        status: 400,
        message: 'A clinic with that NIT already exists',
      };
    }

    // Validate responsible user exists and is active
    const responsible = await userRepository.findById(responsibleId);
    if (!responsible || !responsible.isActive) {
      throw {
        status: 400,
        message: 'The specified responsible user does not exist',
      };
    }

    return clinicRepository.create({
      name,
      nit,
      address,
      phone,
      responsibleId,
    });
  },

  /**
   * Updates an existing clinic with validations
   * @param id - Clinic ID to update
   * @param data - Clinic update data
   * @returns Promise with updated clinic
   * @throws Error if validation fails
   */
  async updateClinic(id: number, data: Partial<CreateClinicDTO>) {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw {
        status: 404,
        message: 'Clinic not found',
      };
    }

    // Validate NIT is unique if being updated
    if (data.nit && data.nit !== clinic.nit) {
      const existingClinic = await clinicRepository.findByNit(data.nit);
      if (existingClinic) {
        throw {
          status: 400,
          message: 'A clinic with that NIT already exists',
        };
      }
    }

    // Validate responsible user exists if being updated
    if (data.responsibleId) {
      const responsible = await userRepository.findById(data.responsibleId);
      if (!responsible || !responsible.isActive) {
        throw {
          status: 400,
          message: 'The specified responsible user does not exist',
        };
      }
    }

    return clinicRepository.update(id, data);
  },

  /**
   * Soft deletes a clinic
   * @param id - Clinic ID to delete
   * @returns Promise with deleted clinic
   * @throws Error if clinic not found
   */
  async deleteClinic(id: number) {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw {
        status: 404,
        message: 'Clinic not found',
      };
    }
    return clinicRepository.delete(id);
  },
};
