import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Wallet = sequelize.define(
    'Wallet',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      // enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
      ballance: { allowNull: false, type: DataTypes.INTEGER, defaultValue: 0 },
      last_wallet_history_id: { allowNull: true, type: DataTypes.INTEGER },

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
      // indexes: [{ unique: true, fields: ["phone_number"] }],
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'wallet',
      version: true,
      hooks: {},
    },
  );

  Wallet.associate = (db) => {
    db.Wallet.hasOne(db.Agent, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.Wallet.hasOne(db.Enterprise, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.Wallet.hasMany(db.WalletHistory, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.Wallet.belongsTo(db.WalletHistory, {
      foreignKey: 'last_wallet_history_id',
      as: 'last_wallet_history',
      constraints: false,
      allowNull: true,
      defaultValue: null,
    });
  };

  return Wallet;
};
