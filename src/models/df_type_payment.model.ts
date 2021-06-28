import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const DFTypePayment = sequelize.define(
    'DFTypePayment',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      update_by: DataTypes.INTEGER,
      delete_by: DataTypes.INTEGER,
      is_active: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(IS_READ),
        defaultValue: IS_READ.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(IS_READ)],
            msg: 'Invalid status.',
          },
        },
      },
      create_at: {
        type: DataTypes.DATE,
        allowNull: false,
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      delete_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      // indexes: [{ unique: true, fields: ["enterprise_id", "code"] }],
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'df_type_payment',
      version: true,
      hooks: {},
    },
  );

  DFTypePayment.associate = (db) => {
    db.DFTypePayment.hasMany(db.Order, { foreignKey: { name: 'type_payment_id' } });
  };
  return DFTypePayment;
};
