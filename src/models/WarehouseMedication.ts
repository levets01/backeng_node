
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

/**
 * Warehouse-medication relationship model.
 *
 * Stores the stock quantity of each medication available in each warehouse.
 */
class WarehouseMedication extends Model {
  public id!: number;
  public warehouseId!: number;
  public medicationId!: number;
  public stock!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WarehouseMedication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    medicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medications',
        key: 'id',
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'warehouse_medications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['warehouseId', 'medicationId'],
      },
    ],
  }
);

export default WarehouseMedication;

