import { IS_ACTIVE, PRODUCT_STATUS, GENDER, PRODUCT_ORDER_TYPE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      enterprise_id: { allowNull: true, type: DataTypes.INTEGER },
      code: { allowNull: false, type: DataTypes.STRING },
      name: { type: DataTypes.STRING },
      is_public: { type: DataTypes.INTEGER, defaultValue: 1 },
      description: { type: DataTypes.TEXT },
      order_type: {
        type: DataTypes.INTEGER,
        values: Object.values(PRODUCT_ORDER_TYPE),
        validate: {
          isIn: {
            args: [Object.values(PRODUCT_ORDER_TYPE)],
            msg: 'Hình thức bán không hợp lệ.',
          },
        },
      },
      category_id: { type: DataTypes.INTEGER },
      is_ship_type: { type: DataTypes.INTEGER },
      weight: { type: DataTypes.FLOAT },
      width: { type: DataTypes.FLOAT },
      height: { type: DataTypes.FLOAT },
      length: { type: DataTypes.FLOAT },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(PRODUCT_STATUS),
        defaultValue: PRODUCT_STATUS.PENDING,
        validate: {
          isIn: {
            args: [Object.values(PRODUCT_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
      unit: { type: DataTypes.STRING },
      price: { type: DataTypes.INTEGER },
      star: { type: DataTypes.FLOAT, allowNull: true, },
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
      tableName: 'product',
      version: true,
      hooks: {},
    },
  );

  Product.associate = (db) => {
    db.Product.belongsTo(db.Enterprise, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
    db.Product.belongsTo(db.Category, {
      foreignKey: {
        name: 'category_id',
      },
    });
    db.Product.hasMany(db.ProductMedia, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.ProductCustomAttribute, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.ProductPrice, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.ProductStock, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.ProductAttribute, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.OrderItem, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.Review, {
      foreignKey: {
        name: 'product_id',
      },
    });
    // FIXME: Comment to fix cyclic dependency
    db.Product.hasMany(db.AgentProduct, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Product.hasMany(db.Banner, {
      foreignKey: {
        name: 'product_id',
      },
    });
  };

  return Product;
};
