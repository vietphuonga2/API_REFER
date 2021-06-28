import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      // enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
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
      df_province_id: { allowNull: true, type: DataTypes.INTEGER },
      df_district_id: { allowNull: true, type: DataTypes.INTEGER },
      df_ward_id: { allowNull: true, type: DataTypes.INTEGER },
      lat: { allowNull: true, type: DataTypes.INTEGER },
      long: { allowNull: true, type: DataTypes.INTEGER },
      location_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ship_merchant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      last_order_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: 'customer',
      version: true,
      hooks: {},
    },
  );

  Customer.associate = (db) => {
    db.Customer.belongsTo(db.DFProvince, { foreignKey: { name: 'df_province_id' } });
    db.Customer.belongsTo(db.DFDistrict, { foreignKey: { name: 'df_district_id' } });
    db.Customer.belongsTo(db.DFWard, { foreignKey: { name: 'df_ward_id' } });

    db.Customer.hasMany(db.Order, {
      foreignKey: {
        name: 'customer_id',
      },
    });
  };

  return Customer;
};
