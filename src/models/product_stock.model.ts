import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductStock = sequelize.define(
    'ProductStock',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: false, type: DataTypes.INTEGER },
      stock_id: { allowNull: false, type: DataTypes.INTEGER },

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
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: IS_ACTIVE.ACTIVE,
      },
    },
    {
      // indexes: [{ unique: true, fields: ['product_id', 'stock_id'] }],
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'product_stock',
      version: true,
      hooks: {},
    },
  );

  ProductStock.associate = (db) => {
    db.ProductStock.belongsTo(db.Stock, {
      foreignKey: {
        name: 'stock_id',
      },
    });
    db.ProductStock.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
  };

  return ProductStock;
};
