import { IS_ACTIVE, USER_STATUS, GENDER, PACKAGE_TYPE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Package = sequelize.define(
    'Package',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: DataTypes.STRING,
      type: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(PACKAGE_TYPE),
      },

      day: {
        type: DataTypes.INTEGER,
      },
      max_agent: {
        type: DataTypes.INTEGER,
      },
      max_product: {
        type: DataTypes.INTEGER,
      },
      price: {
        type: DataTypes.INTEGER,
      },
      discount_percent: {
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
      tableName: 'package',
      version: true,
      hooks: {},
    },
  );

  Package.associate = (db) => {
    // db.User.belongsTo(db.Role, {
    //   foreignKey: {
    //     name: 'role_id',
    //   },
    // });
    // db.User.belongsTo(db.DFProvince, {
    //   foreignKey: {
    //     name: 'province_id',
    //   },
    // });
  };

  // User.beforeSave((user, options) => {
  //   console.log({ user });
  //   if (user.changed('password')) {
  //     console.log({ user });
  //     user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
  //   }
  // });

  // User.prototype.generateToken = function generateToken() {
  //   return createJWToken({ phone_number: this.phone_number, id: this.id });
  // };

  // User.prototype.authenticate = function authenticate(value) {
  //   if (bcrypt.compareSync(value, this.password)) return true;
  //   else return false;
  // };
  return Package;
};
