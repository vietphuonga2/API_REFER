import { createJWToken } from '@config/auth';
import { IS_ACTIVE, USER_STATUS, GENDER, getFullUrl } from '@commons/constant';
import * as bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
      df_type_user_id: DataTypes.INTEGER,
      user_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
          len: [6, 100],
        },
      },
      token: {
        type: DataTypes.STRING,
      },
      last_login_date: DataTypes.DATE,
      reset_password: DataTypes.STRING,
      expired_reset_password: DataTypes.DATE,
      device_id: DataTypes.STRING,
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING,
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
      profile_picture_url: {
        type: DataTypes.STRING,
        get() {
          return getFullUrl(this.getDataValue('profile_picture_url'));
        },
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(USER_STATUS),
        defaultValue: USER_STATUS.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(USER_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        allowNull: true,
        type: DataTypes.INTEGER,
        values: Object.values(GENDER),
        validate: {
          isIn: {
            args: [Object.values(GENDER)],
            msg: 'Invalid gender.',
          },
        },
      },
      address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      province_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      expired_at: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        // get() {
        //   // return new Date(this.getDataValue("created_at") * 1000);
        // },
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
      tableName: 'user',
      version: true,
      hooks: {},
    },
  );

  User.associate = (db) => {
    db.User.belongsTo(db.DFTypeUser, {
      foreignKey: {
        name: 'df_type_user_id',
      },
    });
    db.User.belongsTo(db.Enterprise, {
      foreignKey: { name: 'enterprise_id' },
    });
    db.User.belongsTo(db.DFProvince, {
      foreignKey: {
        name: 'province_id',
      },
    });

    db.User.hasOne(db.Agent, {
      foreignKey: { name: 'user_id' },
    });

    db.User.hasOne(db.Notification, {
      foreignKey: { name: 'user_id' },
    });
  };

  User.beforeSave((user, options) => {
    console.log({ user });
    if (user.changed('password')) {
      console.log({ user });
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  User.prototype.generateToken = function generateToken() {
    return createJWToken({
      phone: this.phone,
      id: this.id,
      enterprise_id: this.enterprise_id,
      df_type_user_id: this.df_type_user_id,
    });
  };

  User.prototype.authenticate = function authenticate(value) {
    if (bcrypt.compareSync(value, this.password)) return true;
    else return false;
  };

  User.generatePassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  };
  return User;
};
