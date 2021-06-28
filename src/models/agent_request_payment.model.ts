import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';
import * as Enterprise from './enterprise.model';
import * as Agent from './agent.model';

module.exports = function (sequelize, DataTypes) {
  const AgentRequestPayment = sequelize.define(
    'AgentRequestPayment',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      agent_id: { type: DataTypes.INTEGER },
      enterprise_id: { type: DataTypes.INTEGER },
      money: { allowNull: true, type: DataTypes.INTEGER },
      status: { allowNull: true, type: DataTypes.INTEGER },
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
      tableName: 'agent_request_payment',
      version: true,
      hooks: {},
    },
  );

  AgentRequestPayment.associate = (db) => {
    // db.AgentRequestPayment.belongsTo(db.Agent, {
    //   foreignKey: { name: 'agent_id' },
    //   constraints: false,
    // });
    // db.AgentRequestPayment.belongsTo(db.Enterprise, { foreignKey: { name: 'enterprise_id' } });
  };
  return AgentRequestPayment;
};
