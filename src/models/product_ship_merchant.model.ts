import { IS_ACTIVE, USER_STATUS, IS_READ } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductShipMerchant = sequelize.define(
    'ProductShipMerchant',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: false, type: DataTypes.INTEGER },
      ship_merchant_id: { allowNull: false, type: DataTypes.INTEGER },
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
      tableName: 'product_ship_merchant',
      version: true,
      hooks: {},
    },
  );

  ProductShipMerchant.associate = (db) => {
    db.ProductShipMerchant.belongsTo(db.DFShipmerchant, { foreignKey: { name: 'ship_merchant_id' } });
  };
  return ProductShipMerchant;
};
