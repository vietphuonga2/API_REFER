import {
  IS_ACTIVE,
  AGENT_ENTERPRISE_STATUS,
  GENDER,
  AGENT_TYPE,
  ENTERPRISE_STATUS,
  CONFIG,
  ROLE,
  apiCode,
} from '@commons/constant';

const db = require('@models');
const { sequelize, Sequelize, Enterprise } = db.default;
const { Op } = Sequelize;

export async function validateEnterpriseCode(code: string): Promise<any> {
  const foundEnterprise = await Enterprise.findOne({
    attributes: ['id', 'name'],
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  return foundEnterprise;
}
