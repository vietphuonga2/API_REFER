import { IS_ACTIVE, USER_STATUS, GENDER, AGENT_TYPE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Agent = sequelize.define(
    'Agent',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: { allowNull: true, type: DataTypes.INTEGER },
      province_id: { type: DataTypes.INTEGER },
      id_number: { allowNull: true, type: DataTypes.STRING },
      total_product: { type: DataTypes.INTEGER, defaultValue: 0 },
      total_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      wallet_id: { type: DataTypes.INTEGER },
      agent_shop_id: { type: DataTypes.INTEGER },
      referal_agent_id: { type: DataTypes.INTEGER },
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
      tableName: 'agent',
      version: true,
      hooks: {},
    },
  );

  Agent.associate = (db) => {
    db.Agent.belongsTo(db.User, {
      foreignKey: { name: 'user_id' },
    });
    db.Agent.belongsTo(db.Wallet, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.Agent.belongsTo(db.AgentShop, {
      constraints: false,
      foreignKey: {
        name: 'agent_shop_id',
      },
      as: 'default_shop',
    });

    db.Agent.hasMany(db.Wishlist, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.AgentEnterprise, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.ProductPrice, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.AgentProduct, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.AgentCart, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.AgentShop, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.AgentRequestPayment, {
      foreignKey: {
        name: 'agent_id',
      },
      constraints: false,
    });
    db.Agent.hasMany(db.Order, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Agent.hasMany(db.Review, {
      foreignKey: {
        name: 'agent_id',
      },
    });
  };

  return Agent;
};
