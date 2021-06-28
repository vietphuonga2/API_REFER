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
import { ApplicationController } from './';
import { category, atrribute, atrributeDetail } from './mock/category';
import Joi from '../helpers/validationHelper';
import { required } from 'joi';
import { enterprises } from './mock/enterprises';

const db = require('@models');
const { Role, DFProvince, sequelize, Sequelize, User, Category, CategoryAttribute, AttributeOption, Level } =
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
@Route('level')
@Tags('level')
export class LevelController extends ApplicationController {
  constructor() {
    super('Level');
  }

  // dánh sách level
  @Security('jwt')
  @Get('/')
  public async listLevel(@Request() request: any): Promise<SuccessResponseModel<any>> {
    const { enterprise_id } = request.user.data;
    const level = await Level.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, enterprise_id } });
    return withSuccess(level);
  }
  // thêm level
  @Security('jwt')
  @Post('/')
  public async createLevel(
    @Request() request: any,
    @Body() body: { name: string; value: string; description: string; revenue_limit?: number; display_order?: number },
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().allow('', null),
      display_order: Joi.number().allow('', null),
      revenue_limit: Joi.number().allow('', null),
      description: Joi.string().allow('', null),
    });
    const { enterprise_id } = request.user.data;
    const { name, value, display_order, revenue_limit, description } = await schema.validateAsync(body);

    const level = await super._findOne({
      where: { name: body.name, is_active: IS_ACTIVE.ACTIVE, enterprise_id },
    });
    // return withSuccess(category);
    if (level) throw apiCode.LEVEL_EXIST;
    // return withSuccess(request.user.data);
    const data = await super._create({ ...body, name: body.name, enterprise_id });
    // return withSuccess(data)
    return this.detailLevel(data.id);
  }

  @Security('jwt')
  @Put('/:level_id')
  public async updateLevel(
    level_id,
    @Request() request: any,
    @Body() body: { name: string; value: string; description: string; revenue_limit?: number; display_order?: number },
  ): Promise<SuccessResponseModel<any>> {
    // return withSuccess(level_id);
    const schema = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().allow('', null),
      display_order: Joi.number().allow('', null),
      revenue_limit: Joi.number().allow('', null),
      description: Joi.string().allow('', null),
    });
    const { name, value, display_order, revenue_limit, description } = await schema.validateAsync(body);

    const level = await super._findOne({
      where: { id: level_id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!level) throw apiCode.DATA_NOT_EXIST;
    const { id } = request.user.data;
    const data = await Level.update(
      { ...body, name: body.name, enterprise_id: id },
      { where: { id: level_id, is_active: IS_ACTIVE.ACTIVE } },
    );
    return this.detailLevel(level_id);
  }

  @Security('jwt')
  @Delete('/{level_id}')
  public async deleteLevel(level_id: string, @Request() request: any): Promise<SuccessResponseModel<any>> {
    let levelDelete = null;
    if (level_id != '' && level_id != null) {
      levelDelete = JSON.parse(`[${level_id}]`);
    }
    const level = await Level.findAll({
      where: { id: { [Op.in]: levelDelete }, is_active: IS_ACTIVE.ACTIVE },
    });
    if (levelDelete.length > level.length) throw apiCode.DATA_NOT_EXIST;
    const { enterprise_id } = request.user.data;
    const data = await Level.update(
      { is_active: IS_ACTIVE.INACTIVE },
      { where: { id: { [Op.in]: levelDelete }, enterprise_id: enterprise_id, is_active: IS_ACTIVE.ACTIVE } },
    );
    return withSuccess(null);
  }

  @Security('jwt')
  @Get('/{level_id}')
  public async detailLevel(level_id: number): Promise<SuccessResponseModel<any>> {
    const level = await super._findOne({
      where: { id: level_id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!level) throw apiCode.DATA_NOT_EXIST;
    const data = await super._findOne(
      {
        is_active: IS_ACTIVE.INACTIVE,
      },
      {
        where: { id: level_id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    return withSuccess(data);
  }
}
