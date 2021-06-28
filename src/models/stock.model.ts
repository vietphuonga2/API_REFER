import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Stock = sequelize.define(
    'Stock',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
      name: { type: DataTypes.STRING },
      address: { type: DataTypes.STRING },
      df_province_id: { allowNull: true, type: DataTypes.INTEGER },
      df_district: { allowNull: true, type: DataTypes.INTEGER },
      df_ward_id: { allowNull: true, type: DataTypes.INTEGER },
      lat: { allowNull: true, type: DataTypes.DOUBLE },
      long: { allowNull: true, type: DataTypes.DOUBLE },

      create_by: DataTypes.INTEGER,
      update_by: DataTypes.INTEGER,
      delete_by: DataTypes.INTEGER,
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
    },
    {
      // indexes: [{ unique: true, fields: ["phone_number"] }],
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'stock',
      version: true,
      hooks: {},
    },
  );

  Stock.associate = (db) => {
    db.Stock.belongsTo(db.Enterprise, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Stock.hasMany(db.ProductPrice, {
      foreignKey: {
        name: 'stock_id',
      },
    });
    db.Stock.hasMany(db.ProductStock, {
      foreignKey: {
        name: 'stock_id',
      },
    });
    db.Stock.hasMany(db.OrderItem, {
      foreignKey: {
        name: 'stock_id',
      },
    });
  };

  return Stock;
};
