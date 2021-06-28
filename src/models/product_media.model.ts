import { IS_ACTIVE, USER_STATUS, GENDER, getFullUrl } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const ProductMedia = sequelize.define(
    'ProductMedia',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      product_id: { allowNull: true, type: DataTypes.INTEGER },
      media_url: {
        allowNull: false,
        type: DataTypes.STRING,
        get() {
          return getFullUrl(this.getDataValue('media_url'));
        },
      },
      type: DataTypes.INTEGER,
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
      product_custom_attribute_option_id: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      // indexes: [{ unique: true, fields: ["phone_number"] }],
      paranoid: false,
      timestamps: false,
      freezeTableName: true,
      tableName: 'product_media',
      version: true,
      hooks: {},
    },
  );

  ProductMedia.associate = (db) => {
    db.ProductMedia.belongsTo(db.Product, {
      foreignKey: {
        name: 'product_id',
      },
    });
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
  return ProductMedia;
};
