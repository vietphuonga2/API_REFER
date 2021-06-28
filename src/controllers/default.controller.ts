import { IS_ACTIVE, apiCode, USER_STATUS } from '@commons/constant';
import { ApplicationController } from './';
import * as _ from 'lodash';
import Joi from '../helpers/validationHelper';
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Delete,
  Tags,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  PagingResponseModel,
} from './models/BaseResponseModel';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware';
import joi from '../helpers/validationHelper';
const db = require('@models');

const { sequelize, Sequelize, DFProvince, DFDistrict, DFWard, DFShipmerchant } = db.default;
const { Op } = Sequelize;

/**
 * Provide api for all supports, define class
 */
@Route('default')
export class DefaultController extends ApplicationController {
  constructor() {
    super('Default');
  }

  @Tags('default/address')
  @Get('/province')
  public async getListDFProvinces(@Query() search?: string): Promise<SuccessResponseModel<any>> {
    const whereOptions = {
      ...(search && { name: { [Op.like]: `%${search}%` } }),
    };
    const provinces = await DFProvince.findAll({ where: whereOptions });
    return withSuccess(provinces);
  }

  @Tags('default/address')
  @Get('/district')
  public async getListDistricts(
    @Query() province_id: number,
    @Query() search?: string,
  ): Promise<SuccessResponseModel<any>> {
    const whereOptions: any = {
      ...(search && { name: { [Op.like]: `%${search}%` } }),
    };
    if (!_.isNil(province_id)) {
      whereOptions.province_id = province_id;
    }
    const items = await DFDistrict.findAll({ where: whereOptions });
    return withSuccess(items);
  }

  @Tags('default/address')
  @Get('/ward')
  public async getListWards(
    @Query() district_id: number,
    @Query() search?: string,
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.number().empty(['', null, 'null']);
    try {
      const districtId = await schema.validateAsync(district_id);
      const whereOptions: any = {
        ...(search && { name: { [Op.like]: `%${search}%` } }),
      };
      whereOptions.district_id = districtId;
      const items = await DFDistrict.findAll({ where: whereOptions });
      return withSuccess(items);
    } catch (e) {
      return withSuccess([]);
    }
  }

  @Get('/ship-merchant')
  public async getListShipMerchant(
  ): Promise<SuccessResponseModel<any>> {
    try {
      const { count, rows } = await DFShipmerchant.findAndCountAll({ where: { is_active: IS_ACTIVE.ACTIVE } });

      return withSuccess(rows);
    } catch (e) {
      return withSuccess([]);
    }
  }
}
