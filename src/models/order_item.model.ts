import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      order_id: { allowNull: false, type: DataTypes.INTEGER },
      product_id: { allowNull: false, type: DataTypes.INTEGER },
      price: { type: DataTypes.INTEGER },
      agent_price: { type: DataTypes.INTEGER },
      discount_price: { type: DataTypes.INTEGER },
      product: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      quantity: { type: DataTypes.INTEGER },
      stock_id: { type: DataTypes.INTEGER },
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
      tableName: 'order_item',
      version: true,
      hooks: {},
    },
  );

  OrderItem.associate = (db) => {
    db.OrderItem.belongsTo(db.Order, { foreignKey: { name: 'order_id' } });
    db.OrderItem.belongsTo(db.Product, { foreignKey: { name: 'product_id' } });
    db.OrderItem.belongsTo(db.Stock, { foreignKey: { name: 'stock_id' } });
  };
  return OrderItem;
};
