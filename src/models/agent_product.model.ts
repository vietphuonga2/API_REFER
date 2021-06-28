import { IS_ACTIVE, PRODUCT_STATUS, GENDER, PRODUCT_ORDER_TYPE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const AgentProduct = sequelize.define(
    'AgentProduct',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      agent_id: { allowNull: true, type: DataTypes.INTEGER },
      name: { allowNull: false, type: DataTypes.STRING },
      product_id: { type: DataTypes.INTEGER },
      count_product: { type: DataTypes.INTEGER, defaultValue: 0 },
      description: { type: DataTypes.TEXT },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(PRODUCT_STATUS),
        defaultValue: PRODUCT_STATUS.PENDING,
        validate: {
          isIn: {
            args: [Object.values(PRODUCT_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
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
      tableName: 'agent_product',
      version: true,
      hooks: {},
    },
  );

  AgentProduct.associate = (db) => {
    db.AgentProduct.belongsTo(db.Agent, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.AgentProduct.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.AgentProduct.belongsTo(db.ProductPrice, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.AgentProduct.hasMany(db.AgentProductMedia, {
      foreignKey: {
        name: 'agent_product_id',
      },
    });
  };

  return AgentProduct;
};
