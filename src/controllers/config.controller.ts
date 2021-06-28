import {
  Body,
  Security,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Delete,
  Tags,
  Header,
  Request,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from './models/BaseResponseModel';
import { handlePagingMiddleware, pagingMiddleware } from '@middleware/pagingMiddleware';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG } from '@commons/constant';
import { ApplicationController } from '.';
import { category, atrribute, atrributeDetail } from './mock/category';
import Joi from '../helpers/validationHelper';
import { required } from 'joi';
import { AuthorizedUser } from '@commons/types';

const db = require('@models');
const { Role, DFProvince, sequelize, Sequelize, User, Category, CategoryAttribute, AttributeOption, Config } =
  db.default;
const { Op } = Sequelize;

interface AttributeRequestModels {
  name: string;
  type: number;
  display_order: number;
  attribute_option: any;
  // value: string;
  // product_id: number;
  // category_attribute_option_id: number;
}

/**
 * Danh mục sản phẩm
 */
@Route('config')
@Tags('config')
export class ConfigController extends ApplicationController {
  constructor() {
    super('Config');
  }

  // dánh sách level
  @Security('jwt')
  @Get('/')
  public async listConfig(@Request() request: any): Promise<SuccessResponseModel<any>> {
    const { enterprise_id } = request.user.data;
    const config = await Config.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, enterprise_id: enterprise_id } });
    return withSuccess(config);
  }

  // thêm, sửa level
  @Security('jwt', ['enterprise'])
  @Post('/')
  public async createConfig(
    @Request() request: any,
    @Body() body: { name: string; value: string; code: string },
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().allow('', null),
      code: Joi.string().allow('', null),
    });
    const loginUser = request.user?.data as AuthorizedUser;
    // return withSuccess(loginUser);
    const { name, value, code } = await schema.validateAsync(body);

    // const config = await super._findOne({
    //   where: { name: body.name, is_active: IS_ACTIVE.ACTIVE },
    // });
    // // return withSuccess(category);
    // if (config) throw apiCode.LEVEL_EXIST;
    // return withSuccess(request.user.data);
    // const { id } = request.user.data;
    const newConfig = [];
    newConfig.push({ ...body, name: body.name, enterprise_id: loginUser.enterprise_id });
    // return withSuccess(newConfig);
    const data = await sequelize.transaction(async (transaction) => {
      await Config.bulkCreate(newConfig, { transaction, updateOnDuplicate: ['value', 'name'] });
    });
    return withSuccess(data);
    // return this.detailLevel(data);
  }
}
