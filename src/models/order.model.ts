import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';
import * as Agent from './agent.model';

module.exports = function (sequelize, DataTypes) {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: { type: DataTypes.STRING },
      customer_id: { type: DataTypes.INTEGER },
      enterprise_id: { type: DataTypes.INTEGER },
      ship_merchant_id: { type: DataTypes.INTEGER },
      agent_id: { type: DataTypes.INTEGER },
      count_item: { type: DataTypes.INTEGER },
      total_money: { type: DataTypes.INTEGER },
      status_payment_id: { type: DataTypes.INTEGER },
      status_order_id: { type: DataTypes.INTEGER },
      status_ship_id: { type: DataTypes.INTEGER },
      type_payment_id: { type: DataTypes.INTEGER },
      type_ship: { type: DataTypes.INTEGER },
      ship_fee: { type: DataTypes.INTEGER },
      price: { type: DataTypes.INTEGER },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      commission: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: 'order',
      version: true,
      hooks: {},
    },
  );

  Order.associate = (db) => {
    db.Order.belongsTo(db.Enterprise, { foreignKey: { name: 'enterprise_id' } });
    db.Order.belongsTo(db.Agent, { foreignKey: { name: 'agent_id' } });
    db.Order.belongsTo(db.Customer, { foreignKey: { name: 'customer_id' } });
    db.Order.belongsTo(db.DFShipmerchant, { foreignKey: { name: 'ship_merchant_id' } });
    db.Order.belongsTo(db.DFStatusOrder, { foreignKey: { name: 'status_order_id' } });
    db.Order.belongsTo(db.DFStatusShip, { foreignKey: { name: 'status_ship_id' } });
    db.Order.belongsTo(db.DFStatusPayment, { foreignKey: { name: 'status_payment_id' } });
    db.Order.belongsTo(db.DFTypePayment, { foreignKey: { name: 'type_payment_id' } });

    db.Order.hasMany(db.OrderItem, { foreignKey: { name: 'order_id' } });
    db.Order.hasMany(db.Review, { foreignKey: { name: 'order_id' } });
  };
  return Order;
};
