import { IS_ACTIVE, ENTERPRISE_STATUS, getFullUrl } from '@commons/constant';
import * as bcrypt from 'bcryptjs';
import { string } from 'joi';
import * as Sequelize from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Enterprise = sequelize.define(
    'Enterprise',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [6, 128],
            msg: 'Email address must be between 6 and 128 characters in length',
          },
          isEmail: {
            msg: 'Email address must be valid',
          },
        },
      },
      contact_name: DataTypes.STRING,
      address: {
        type: DataTypes.STRING,
      },
      package_id: {
        type: DataTypes.INTEGER,
      },
      active_date: {
        type: DataTypes.DATE,
      },
      expired_date: {
        type: DataTypes.DATE,
      },
      wallet_id: {
        type: DataTypes.INTEGER,
      },
      profile_picture_url: {
        type: DataTypes.STRING,
        get() {
          return getFullUrl(this.getDataValue('profile_picture_url'));
        },
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(ENTERPRISE_STATUS),
        defaultValue: ENTERPRISE_STATUS.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(ENTERPRISE_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },

      /* Some default fields */
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
      tableName: 'enterprise',
      version: true,
      hooks: {},
    },
  );

  Enterprise.associate = (db) => {
    db.Enterprise.belongsTo(db.Wallet, {
      foreignKey: {
        name: 'wallet_id',
      },
    });
    db.Enterprise.belongsTo(db.AgentRequestPayment, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Enterprise.belongsTo(db.Order, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });

    db.Enterprise.hasMany(db.User, {
      foreignKey: { name: 'enterprise_id' },
    });
    db.Enterprise.hasMany(db.Product, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Enterprise.hasMany(db.Stock, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Enterprise.hasMany(db.Config, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Enterprise.hasMany(db.AgentEnterprise, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });

    db.Enterprise.hasMany(db.Post, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });

    db.Enterprise.hasMany(db.Banner, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
  };

  return Enterprise;
};
