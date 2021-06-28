import { IS_ACTIVE, apiCode, USER_STATUS } from '@commons/constant';
import { ApplicationController } from '.';
import * as Joi from 'joi';

const db = require('@models');
const { DFProvince, sequelize, Sequelize } = db.default;
const { Op } = Sequelize;

export class DFProvinceController extends ApplicationController {
  constructor() {
    super('DFProvince');
  }
  getListDFProvince = async (req, res) => {
    const schema = Joi.object()
      .keys({
        page: Joi.number().integer().allow(null, ''),
        search: Joi.string().allow(null, ''),
      })
      .unknown(true);
    const { search } = await schema.validateAsync(req.query);
    const { page, limit, offset } = req.query;
    const option = {
      [Op.or]: [{ name: { [Op.substring]: search } }],
      is_active: IS_ACTIVE.ACTIVE,
    };

    return super._list({
      where: option,
    });
  };
}
