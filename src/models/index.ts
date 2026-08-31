
import User from './User';

import Clinic from './Clinic';

import Warehouse from './Warehouse';

import Medication from './Medication';

import WarehouseMedication from './WarehouseMedication';

import SupplyRequest from './SupplyRequest';

/**
 * Defines the relationships between the application models.
 *
 * These associations configure one-to-many and many-to-many relationships
 * used by Sequelize to manage related data across users, clinics, warehouses,
 * medications, inventory, and supply requests.
 */

User.hasMany(Clinic, { foreignKey: 'responsibleId', as: 'clinics' });

Clinic.belongsTo(User, { foreignKey: 'responsibleId', as: 'responsible' });

User.hasMany(Warehouse, { foreignKey: 'responsibleId', as: 'warehouses' });

Warehouse.belongsTo(User, { foreignKey: 'responsibleId', as: 'responsible' });

Warehouse.belongsToMany(Medication, {

  through: WarehouseMedication,

  foreignKey: 'warehouseId',

  otherKey: 'medicationId',

  as: 'medications',

});

Medication.belongsToMany(Warehouse, {

  through: WarehouseMedication,

  foreignKey: 'medicationId',

  otherKey: 'warehouseId',

  as: 'warehouses',

});

WarehouseMedication.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

WarehouseMedication.belongsTo(Medication, { foreignKey: 'medicationId', as: 'medication' });

Warehouse.hasMany(WarehouseMedication, { foreignKey: 'warehouseId', as: 'stocks' });

Medication.hasMany(WarehouseMedication, { foreignKey: 'medicationId', as: 'stocks' });

Clinic.hasMany(SupplyRequest, { foreignKey: 'clinicId', as: 'requests' });

SupplyRequest.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Warehouse.hasMany(SupplyRequest, { foreignKey: 'warehouseId', as: 'requests' });

SupplyRequest.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Medication.hasMany(SupplyRequest, { foreignKey: 'medicationId', as: 'requests' });

SupplyRequest.belongsTo(Medication, { foreignKey: 'medicationId', as: 'medication' });

User.hasMany(SupplyRequest, { foreignKey: 'requestedById', as: 'requestedBy' });

SupplyRequest.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });

export {

  User,

  Clinic,

  Warehouse,

  Medication,

  WarehouseMedication,

  SupplyRequest,

};

