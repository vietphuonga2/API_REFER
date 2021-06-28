import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductCustomAttributeOption = sequelize.define(
    'ProductCustomAttributeOption',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_custom_attribute_id: { allowNull: true, type: DataTypes.INTEGER },
      name: { type: DataTypes.STRING },
      display_order: DataTypes.INTEGER,

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
      tableName: 'product_custom_attribute_option',
      version: true,
      hooks: {},
    },
  );

  ProductCustomAttributeOption.associate = (db) => {
    db.ProductCustomAttributeOption.belongsTo(db.ProductCustomAttribute, {
      foreignKey: {
        name: 'product_custom_attribute_id',
      },
    });
    db.ProductCustomAttributeOption.hasOne(db.ProductPrice, {
      foreignKey: {
        name: 'custom_attribute_option_id_1',
      },
    });
    db.ProductCustomAttributeOption.hasOne(db.ProductPrice, {
      foreignKey: {
        name: 'custom_attribute_option_id_2',
      },
    });
  };

  return ProductCustomAttributeOption;
};
