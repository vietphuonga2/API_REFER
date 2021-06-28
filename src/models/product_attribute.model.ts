import { IS_ACTIVE, USER_STATUS, GENDER } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductAttribute = sequelize.define(
    'ProductAttribute',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: false, type: DataTypes.INTEGER },
      category_attribute_option_id: { allowNull: true, type: DataTypes.INTEGER },
      category_attribute_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      value: DataTypes.STRING,
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
      tableName: 'product_attribute',
      version: true,
      hooks: {},
    },
  );

  ProductAttribute.associate = (db) => {
    ProductAttribute.belongsTo(db.Product, { foreignKey: { name: 'product_id' } });
    ProductAttribute.belongsTo(db.CategoryAttribute, { foreignKey: { name: 'category_attribute_id' } });
    ProductAttribute.belongsTo(db.AttributeOption, { foreignKey: { name: 'category_attribute_option_id' } });
  };
  return ProductAttribute;
};
