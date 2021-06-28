import { IS_ACTIVE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: true, type: DataTypes.INTEGER },
      order_id: { allowNull: true, type: DataTypes.INTEGER },
      agent_id: { allowNull: true, type: DataTypes.INTEGER },
      comment: { allowNull: true, type: DataTypes.TEXT },
      star: { type: DataTypes.INTEGER },

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
      tableName: 'review',
      version: true,
      hooks: {},
    },
  );

  Review.associate = (db) => {
    db.Review.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
    db.Review.belongsTo(db.Agent, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.Review.belongsTo(db.Order, {
      foreignKey: {
        name: 'order_id',
      },
    });
    db.Review.hasMany(db.ReviewMedia, {
      foreignKey: {
        name: 'review_id',
      },
    });
  };

  return Review;
};
