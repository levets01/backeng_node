import { medicationRepository } from '../repositories/medication.repository';
import { CreateMedicationDTO } from '../types';

/**
 * Medication Service
 * Contains business logic for medication operations
 */
export const medicationService = {
  /**
   * Retrieves all active medications
   * @returns Promise with list of medications
   */
  async getAllMedications() {
    return medicationRepository.findAll();
  },

  /**
   * Retrieves a specific medication by ID with warehouse stock
   * @param id - Medication ID
   * @returns Promise with medication data
   * @throws Error if medication not found
   */
  async getMedicationById(id: number) {
    const medication = await medicationRepository.findById(id);
    if (!medication) {
      throw {
        status: 404,
        message: 'Medication not found',
      };
    }
    return medication;
  },

  /**
   * Creates a new medication with validations
   * Validates: required fields, unit price is positive
   * @param data - Medication creation data
   * @returns Promise with created medication
   * @throws Error if validation fails
   */
  async createMedication(data: CreateMedicationDTO) {
    const { name, description, unitPrice } = data;

    // Validate required fields
    if (!name || !unitPrice) {
      throw {
        status: 400,
        message: 'Name and unit price are required',
      };
    }

    // Validate unit price is positive
    if (unitPrice <= 0) {
      throw {
        status: 400,
        message: 'Unit price must be greater than zero',
      };
    }

    return medicationRepository.create({
      name,
      description,
      unitPrice,
    });
  },

  /**
   * Updates an existing medication with validations
   * @param id - Medication ID to update
   * @param data - Medication update data
   * @returns Promise with updated medication
   * @throws Error if validation fails
   */
  async updateMedication(id: number, data: Partial<CreateMedicationDTO>) {
    const medication = await medicationRepository.findById(id);
    if (!medication) {
      throw {
        status: 404,
        message: 'Medication not found',
      };
    }

    // Validate unit price if being updated
    if (data.unitPrice && data.unitPrice <= 0) {
      throw {
        status: 400,
        message: 'Unit price must be greater than zero',
      };
    }

    return medicationRepository.update(id, data);
  },

  /**
   * Soft deletes a medication
   * @param id - Medication ID to delete
   * @returns Promise with deleted medication
   * @throws Error if medication not found
   */
  async deleteMedication(id: number) {
    const medication = await medicationRepository.findById(id);
    if (!medication) {
      throw {
        status: 404,
        message: 'Medication not found',
      };
    }
    return medicationRepository.delete(id);
  },
};
