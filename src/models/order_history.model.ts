import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const OrderHistory = sequelize.define(
    'OrderHistory',
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
      order_id: { type: DataTypes.INTEGER },
      df_order_update_type_id: { type: DataTypes.INTEGER },
      note: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: 'order_history',
      version: true,
      hooks: {},
    },
  );

  OrderHistory.associate = (db) => {
    db.OrderHistory.belongsTo(db.Order, { foreignKey: { name: 'order_id' } });
    db.OrderHistory.belongsTo(db.Enterprise, { foreignKey: { name: 'enterprise_id' } });
    db.OrderHistory.belongsTo(db.Agent, { foreignKey: { name: 'agent_id' } });
    db.OrderHistory.belongsTo(db.Customer, { foreignKey: { name: 'customer_id' } });
    db.OrderHistory.belongsTo(db.DFShipmerchant, { foreignKey: { name: 'ship_merchant_id' } });
    db.OrderHistory.belongsTo(db.DFStatusOrder, { foreignKey: { name: 'status_order_id' } });
    db.OrderHistory.belongsTo(db.DFStatusShip, { foreignKey: { name: 'status_ship_id' } });
    db.OrderHistory.belongsTo(db.DFStatusPayment, { foreignKey: { name: 'status_payment_id' } });
    db.OrderHistory.belongsTo(db.DFTypePayment, { foreignKey: { name: 'type_payment_id' } });
  };
  return OrderHistory;
};
