import { IS_ACTIVE, USER_STATUS, TRANSACTION_MODE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const WalletHistory = sequelize.define(
    'WalletHistory',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      // enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
      wallet_id: { allowNull: false, type: DataTypes.INTEGER },
      transaction_mode: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(TRANSACTION_MODE),
        defaultValue: TRANSACTION_MODE.PLUS,
        validate: {
          isIn: {
            args: [Object.values(TRANSACTION_MODE)],
            msg: 'Invalid mode.',
          },
        },
      },
      df_transaction_type_id: {
        type: DataTypes.INTEGER,
      },
      item_id: {
        type: DataTypes.INTEGER,
      },

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
      tableName: 'wallet_history',
      version: true,
      hooks: {},
    },
  );

  WalletHistory.associate = (db) => {
    db.WalletHistory.belongsTo(db.Wallet, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.WalletHistory.belongsTo(db.DFTransactionType, {
      foreignKey: {
        name: 'df_transaction_type_id',
      },
    });
    db.WalletHistory.hasOne(db.Wallet, {
      foreignKey: {
        name: 'last_wallet_history_id',
      },
      as: 'last_wallet_history',
      constraints: false,
      allowNull: true,
      defaultValue: null,
    });
  };

  return WalletHistory;
};
