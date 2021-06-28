import { IS_ACTIVE, PRODUCT_PRICE_STATUS } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductPrice = sequelize.define(
    'ProductPrice',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: true, type: DataTypes.INTEGER },
      percent: { allowNull: true, type: DataTypes.INTEGER },
      stock_id: { allowNull: true, type: DataTypes.INTEGER },
      level_id: { allowNull: true, type: DataTypes.INTEGER },
      price: { allowNull: true, type: DataTypes.INTEGER },
      // commission_percent: { allowNull: true, type: DataTypes.INTEGER },
      custom_attribute_option_id_1: { allowNull: true, type: DataTypes.INTEGER },
      custom_attribute_option_id_2: { allowNull: true, type: DataTypes.INTEGER },
      agent_id: { allowNull: true, type: DataTypes.INTEGER },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(PRODUCT_PRICE_STATUS),
        defaultValue: PRODUCT_PRICE_STATUS.AVAILABLE,
        validate: {
          isIn: {
            args: [Object.values(PRODUCT_PRICE_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
      create_by: DataTypes.INTEGER,
      update_by: DataTypes.INTEGER,
      delete_by: DataTypes.INTEGER,
      create_at: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tier_index: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: '[]',
        get() {
          const tier_index = this.getDataValue('tier_index');
          if (!tier_index) return [];
          return tier_index;
        },
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
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'product_price',
      version: true,
      hooks: {},
    },
  );

  ProductPrice.associate = (db) => {
    db.ProductPrice.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.ProductPrice.belongsTo(db.Stock, {
      foreignKey: {
        name: 'stock_id',
      },
    });
    db.ProductPrice.belongsTo(db.ProductCustomAttributeOption, {
      foreignKey: {
        name: 'custom_attribute_option_id_1',
      },
      as: 'product_attribute_name_1',
    });
    db.ProductPrice.belongsTo(db.ProductCustomAttributeOption, {
      foreignKey: {
        name: 'custom_attribute_option_id_2',
      },
      as: 'product_attribute_name_2',
    });
    db.ProductPrice.belongsTo(db.Agent, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.ProductPrice.belongsTo(db.AgentProduct, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.ProductPrice.belongsTo(db.Level, {
      foreignKey: {
        name: 'level_id',
      },
    });

    db.ProductPrice.hasMany(db.AgentCart, {
      foreignKey: {
        name: 'product_price_id',
      },
    });
  };

  return ProductPrice;
};
