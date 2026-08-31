import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';


/**

* Drug model.

* Represents the drugs available in the system.

*/

class Medication extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public unitPrice!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Medication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'medications',
    timestamps: true,
  }
);

export default Medication;
