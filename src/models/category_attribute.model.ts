import { createJWToken } from '@config/auth';
import { IS_ACTIVE, CATEGORY_STATUS, GENDER } from '@commons/constant';
import * as bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const CategoryAttribute = sequelize.define(
    'CategoryAttribute',
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
      category_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      display_order: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      type: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: CATEGORY_STATUS.ACTIVE,
      },

      create_by: DataTypes.INTEGER,
      update_by: DataTypes.INTEGER,
      delete_by: DataTypes.INTEGER,
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
      // indexes: [{ unique: true, fields: ["phone_number"] }],
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'category_attribute',
      version: true,
      hooks: {},
    },
  );

  CategoryAttribute.associate = (db) => {
    db.CategoryAttribute.belongsTo(db.Category, {
      foreignKey: {
        name: 'category_id',
      },
    });
    db.CategoryAttribute.hasMany(db.AttributeOption, {
      foreignKey: { name: 'attribute_id' },
    });

    db.CategoryAttribute.hasMany(db.CategoryAttribute, {
      foreignKey: { name: 'category_attribute_id' },
    });
  };
  return CategoryAttribute;
};
