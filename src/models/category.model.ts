import { createJWToken } from '@config/auth';
import { IS_ACTIVE, CATEGORY_STATUS, GENDER, getFullUrl } from '@commons/constant';
import * as bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Category = sequelize.define(
    'Category',
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
      parent_id: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      display_order: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      icon_url: {
        type: DataTypes.STRING,
        get() {
          return getFullUrl(this.getDataValue('icon_url'));
        },
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
      tableName: 'category',
      version: true,
      hooks: {},
    },
  );

  Category.associate = (db) => {
    db.Category.hasMany(db.CategoryAttribute, {
      foreignKey: { name: 'category_id' },
    });
    db.Category.hasMany(db.Wishlist, {
      foreignKey: { name: 'category_id' },
    });
    db.Category.hasMany(db.Product, {
      foreignKey: {
        name: 'category_id',
      },
    });
    db.Category.belongsTo(db.Category, {
      as: 'parent_category',
      foreignKey: 'parent_id',
    });
    // db.User.belongsTo(db.Enterprise, {
    //   foreignKey: { name: 'enterprise_id' },
    // });
    // db.User.belongsTo(db.DFProvince, {
    //   foreignKey: {
    //     name: 'province_id',
    //   },
    // });
  };
  return Category;
};
