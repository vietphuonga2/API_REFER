import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const AgentShop = sequelize.define(
    'AgentShop',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lat: { allowNull: true, type: DataTypes.INTEGER },
      long: { allowNull: true, type: DataTypes.INTEGER },
      location_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agent_id: { allowNull: false, type: DataTypes.INTEGER },
      phone: { allowNull: true, type: DataTypes.STRING },
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
      tableName: 'agent_shop',
      version: true,
      hooks: {},
    },
  );

  AgentShop.associate = (db) => {
    db.AgentShop.belongsTo(db.Agent, { foreignKey: { name: 'agent_id' } });
    db.AgentShop.hasOne(db.Agent, { foreignKey: { name: 'agent_shop_id' }, as: 'default_shop', constraints: false });
  };
  return AgentShop;
};
