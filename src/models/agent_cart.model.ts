import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const AgentCart = sequelize.define(
    'AgentCart',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_price_id: { allowNull: false, type: DataTypes.INTEGER },
      agent_id: { allowNull: false, type: DataTypes.INTEGER },
      quantity: { allowNull: false, type: DataTypes.INTEGER },
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
      // indexes: [{ unique: true, fields: ["enterprise_id", "code"] }],
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'agent_cart',
      version: true,
      hooks: {},
    },
  );

  AgentCart.associate = (db) => {
    db.AgentCart.belongsTo(db.Agent, { foreignKey: { name: 'agent_id' } });
    db.AgentCart.belongsTo(db.ProductPrice, { foreignKey: { name: 'product_price_id' } });
  };
  return AgentCart;
};
