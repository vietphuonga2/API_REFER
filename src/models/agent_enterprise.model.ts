import { IS_ACTIVE, AGENT_ENTERPRISE_STATUS, GENDER, AGENT_TYPE } from '@commons/constant';
import { Sequelize } from 'sequelize';

module.exports = function (sequelize, DataTypes) {
  const AgentEnterprise = sequelize.define(
    'AgentEnterprise',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      enterprise_id: { allowNull: false, type: DataTypes.INTEGER },
      agent_id: { allowNull: false, type: DataTypes.INTEGER },
      type: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(AGENT_TYPE),
        defaultValue: AGENT_TYPE.FREE,
      },

      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
        values: Object.values(AGENT_ENTERPRISE_STATUS),
        defaultValue: AGENT_ENTERPRISE_STATUS.ACTIVE,
        validate: {
          isIn: {
            args: [Object.values(AGENT_ENTERPRISE_STATUS)],
            msg: 'Invalid status.',
          },
        },
      },
      revenue: {
        type: DataTypes.INTEGER,
      },
      comission: {
        type: DataTypes.INTEGER,
      },
      count_product: {
        type: DataTypes.INTEGER,
      },
      count_order: {
        type: DataTypes.INTEGER,
      },
      level_id: {
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
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
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
      tableName: 'agent_enterprise',
      version: true,
      hooks: {},
    },
  );

  AgentEnterprise.associate = (db) => {
    db.AgentEnterprise.belongsTo(db.Agent, {
      foreignKey: {
        name: 'agent_id',
      },
    });
    db.AgentEnterprise.belongsTo(db.Level, {
      foreignKey: {
        name: 'level_id',
      },
    });
    db.AgentEnterprise.belongsTo(db.Enterprise, {
      foreignKey: {
        name: 'enterprise_id',
      },
    });
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
  return AgentEnterprise;
};
