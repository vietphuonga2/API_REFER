import { createJWToken } from '@config/auth';
import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import * as bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const DFWard = sequelize.define(
    'DFWard',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      value: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      prefix: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      district_id: DataTypes.INTEGER,
      is_active: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(IS_ACTIVE),
        defaultValue: IS_ACTIVE.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(IS_ACTIVE)],
            msg: 'Invalid status.',
          },
        },
      },
      create_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
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
      // indexes: [{ unique: true, fields: ["phone_number"] }],
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'df_ward',
      version: true,
      hooks: {},
    },
  );

  DFWard.associate = (db) => {
    db.DFWard.belongsTo(db.DFDistrict, {
      foreignKey: {
        name: 'district_id',
      },
    });
    db.DFWard.hasMany(db.Customer, {
      foreignKey: {
        name: 'df_ward_id',
      },
    });
  };

  return DFWard;
};
