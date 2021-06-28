import { IS_ACTIVE, BANNER_TYPE, BANNER_STATUS } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Banner = sequelize.define(
    'Banner',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: { type: DataTypes.TEXT },
      description: { type: DataTypes.TEXT },
      enterprise_id: { type: DataTypes.INTEGER },
      gift_hunting_status: { type: DataTypes.INTEGER },
      gift_code: { type: DataTypes.STRING },
      time_hunting: { type: DataTypes.DATE },
      media_url: { type: DataTypes.STRING },
      product_id: { type: DataTypes.INTEGER },
      status: {
        type: DataTypes.INTEGER,
        values: Object.values(BANNER_STATUS),
        defaultValue: BANNER_STATUS.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(BANNER_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
      type: {
        type: DataTypes.INTEGER,
        values: Object.values(BANNER_TYPE),
        defaultValue: BANNER_TYPE.NORMAL,
        validate: {
          isIn: {
            args: [Object.values(BANNER_TYPE)],
            msg: 'Invalid type.',
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
      tableName: 'banner',
      version: true,
      hooks: {},
    },
  );

  Banner.associate = (db) => {
    db.Banner.belongsTo(db.Enterprise, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Banner.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
  };

  return Banner;
};
