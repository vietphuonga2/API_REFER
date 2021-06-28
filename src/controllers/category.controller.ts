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
import { IS_ACTIVE, AppError, apiCode, USER_STATUS, ROLE, GENDER, CONFIG, CATEGORY_STATUS } from '@commons/constant';
import { ApplicationController } from './';
import { category, atrribute, atrributeDetail } from './mock/category';
import Joi from '../helpers/validationHelper';
import { required } from 'joi';
import { where } from 'sequelize/types';
import { includes } from 'lodash';

const db = require('@models');
const { Role, DFProvince, sequelize, Sequelize, User, Category, CategoryAttribute, AttributeOption } = db.default;
const { Op } = Sequelize;

interface AttributeRequestModel {
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
@Route('category')
@Tags('category')
export class CategoryController extends ApplicationController {
  constructor() {
    super('Category');
  }
  /**
   * @summary Danh sách danh mục cha ( nếu parent_id =  null là danh mục cha)
   */

  @Get('/')
  public async listCategory(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
    @Query() search?: string,
    @Query() status?: any,
    @Query() parent_id?: number,
  ): Promise<SuccessResponseModel<any>> {
    // return withSuccess(Object.values(CATEGORY_STATUS));
    const { offset, limit, page } = handlePagingMiddleware(request);
    let whereOption;
    whereOption = {
      name: search ? { [Op.substring]: search } : { [Op.ne]: null },
      // status: { [Op.in]: ![null, ''].includes(status) ? [status] : Object.values(CATEGORY_STATUS) },
      parent_id: parent_id ? parent_id : null,
      is_active: IS_ACTIVE.ACTIVE,
    };

    if (status) {
      whereOption.status = { [Op.in]: ![null, ''].includes(status) ? [status] : Object.values(CATEGORY_STATUS) };
    }
    // if (parent_id) {
    //   whereOption.parent_id = parent_id;
    // }
    const { count, rows } = await Category.findAndCountAll({
      where: whereOption,
      include: {
        model: Category,
        as: 'parent_category',
        atrributes: ['id', 'name'],
        include: {
          model: CategoryAttribute,
          atrributes: ['id', 'name'],
        },
      },
      page,
      offset,
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }
  /**
   * @summary Thêm danh mục cha / hoặc con
   */
  @Post('/')
  // @Security('jwt')
  public async createCategory(
    @Body() body: { name: string; parent_id?: any; display_order: number; icon_url: string },
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      icon_url: Joi.string().required(),
      parent_id: Joi.number().allow(null, ''),
      display_order: Joi.number().allow('', null),
      status: Joi.string().default(IS_ACTIVE.ACTIVE),
    });
    const { name, parent_id, display_order, icon_url } = await schema.validateAsync(body);
    const category = await super._findOne({
      where: { name: { [Op.substring]: body.name }, parent_id: body.parent_id || null, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(category);
    if (category != null) throw new AppError(apiCode.CATEGORY_EXIST);

    const data = await super._create({ ...body, name: body.name });

    return this.getDetailCategory(data.id);
  }

  /**
   * @summary Sửa danh mục cha/ con
   */
  @Put('/{id}')
  // @Security('jwt')
  public async updateCategory(
    id: number,
    @Request() request: any,
    @Body() body: { name: string; parent_id?: any; display_order: number; icon_url: string },
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      icon_url: Joi.string().required(),
      parent_id: Joi.number().allow('', null),
      display_order: Joi.number().allow('', null),
    });
    const { name, parent_id, display_order, icon_url } = await schema.validateAsync(body);
    const checkCategory = await super._findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    if (!checkCategory) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const category = await super._findOne({
      where: {
        id: { [Op.ne]: id },
        name: { [Op.substring]: body.name },
        parent_id: body.parent_id ? body.parent_id : null,
        is_active: IS_ACTIVE.ACTIVE,
      },
    });
    if (category) throw new AppError(apiCode.CATEGORY_EXIST);
    const data = await super._update(
      {
        ...body,
        name: body.name,
      },
      {
        where: { id: id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    return this.getDetailCategory(id);
  }
  /**
   * @summary Update trạng thái danh mục cha/ con
   */
  @Put('/{id}/change-status')
  public async changeStatus(
    id: number,
    @Request() request: any,
    @Body() body: { status: number },
  ): Promise<SuccessResponseModel<any>> {
    const checkCategory = await super._findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    if (!checkCategory) throw new AppError(apiCode.CATEGORY_ERROR);
    const data = await super._update(
      {
        status: body.status,
      },
      {
        where: { id: id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    return withSuccess(data);
  }
  /**
   * @summary Xóa danh mục cha /con
   */
  @Delete('/{id}')
  // @Security('jwt')
  public async deleteCategory(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
    const checkCategory = await super._findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    // return withSuccess(checkCategory);
    if (!checkCategory) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const checkParentCategory = await super._findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, parent_id: id },
    });
    if (checkParentCategory) throw new AppError(apiCode.CATEGORY_PARENT_NOT_EXIST);
    const data = await super._update(
      {
        is_active: IS_ACTIVE.INACTIVE,
      },
      {
        where: { id: id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    return withSuccess(data);
  }
  /**
   * @summary Thêm thuộc tính cho danh mục
   */
  @Post('/{id}/attribute')
  public async createAtrribute(
    id: number,
    @Request() request: any,
    @Body()
    body: AttributeRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      type: Joi.number().allow('', null),
      display_order: Joi.number().allow('', null),
      attribute_option: Joi.array()
        .items(
          Joi.object()
            .keys({
              // attribute_id: Joi.number().integer().allow(null, ''),
              display_order_attr: Joi.number().integer().allow(null, ''),
              name_attr: Joi.string().allow(null, ''),
            })
            .unknown(true),
        )
        .required(),
    });
    const { name, display_order, type, attribute_option } = await schema.validateAsync(body);
    const category = await super._findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE, parent_id: null },
    });
    // return withSuccess(category);
    if (!category) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const attribute = await CategoryAttribute.create({
      category_id: id,
      name,
      type,
      display_order,
    });
    const atributeOption = attribute_option.map((element) => ({
      attribute_id: attribute.id,
      display_order: element.display_order_attr,
      name: element.name_attr,
    }));
    // return withSuccess(atributeOption);
    const data = await sequelize.transaction(async (transaction) => {
      await AttributeOption.bulkCreate(atributeOption, { transaction });
    });
    return withSuccess(data);
  }
  /**
   * @summary Lấy danh sách thuộc tính của danh mục
   */
  @Get('/{id}/attribute')
  public async listAtrribute(
    id: number,
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
    @Query() search?: string,
    @Query() type?: number,
  ): Promise<SuccessResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);
    const checkCategory = await Category.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    if (!checkCategory) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    let whereOption;
    whereOption = {
      category_id: id,
      name: search ? { [Op.substring]: search } : { [Op.ne]: null },
      is_active: IS_ACTIVE.ACTIVE,
    };
    if (type) {
      whereOption.type = type;
    }
    const { count, rows } = await CategoryAttribute.findAndCountAll({
      where: whereOption,
      include: [
        {
          model: AttributeOption,
          required: false,
          attributes: ['id', 'name', 'display_order'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
      ],
      page,
      offset,
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }
  /**
   * @summary Sửa  thuộc tính của đanh mục
   */
  @Put('/{id}/attribute/{attribute_id}')
  public async updateAtrribute(
    attribute_id: number,
    id: number,
    @Request() request: any,
    @Body()
    body: AttributeRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      name: Joi.string().required(),
      type: Joi.number().allow('', null),
      display_order: Joi.number().allow('', null),
      attribute_option: Joi.array()
        .items(
          Joi.object()
            .keys({
              display_order_attr: Joi.number().integer().allow(null, ''),
              name_attr: Joi.string().allow(null, ''),
            })
            .unknown(true),
        )
        .required(),
    });
    const { name, display_order, type, attribute_option } = await schema.validateAsync(body);
    // Kiểm tra danh mục cha
    const category = await super._findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
    });
    // Kiểm tra thuộc tính
    if (!category) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const categoryAtrribute = await CategoryAttribute.findOne({
      where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(category);
    if (!categoryAtrribute) throw new AppError(apiCode.ATRRIBUTE_NOT_EXIST);
    const categoryOp = await AttributeOption.update(
      { is_active: IS_ACTIVE.INACTIVE },
      { where: { attribute_id, is_active: IS_ACTIVE.ACTIVE } },
    );

    const attribute = await CategoryAttribute.update(
      {
        name,
        type,
        display_order,
      },
      {
        where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    const atributeOption = attribute_option.map((element) => ({
      attribute_id,
      display_order: element.display_order_attr,
      name: element.name_attr,
    }));
    // return withSuccess(atributeOption);
    const data = await sequelize.transaction(async (transaction) => {
      await AttributeOption.bulkCreate(atributeOption, { transaction });
    });
    return withSuccess(data);
  }
  /**
   * @summary Xóa thuộc tính
   */
  @Delete('/{id}/attribute/{attribute_id}')
  public async deleteAtrribute(attribute_id: number, id: number): Promise<SuccessResponseModel<any>> {
    // Kiểm tra danh mục cha
    const category = await super._findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
    });
    // Kiểm tra thuộc tính
    if (!category) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const categoryAtrribute = await CategoryAttribute.findOne({
      where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(category);
    if (!categoryAtrribute) throw new AppError(apiCode.ATRRIBUTE_NOT_EXIST);
    const data = await sequelize.transaction(async (transaction) => {
      await CategoryAttribute.update(
        { is_active: IS_ACTIVE.INACTIVE },
        { where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE }, transaction },
      );
      await AttributeOption.findAll(
        { is_active: IS_ACTIVE.INACTIVE },
        { where: { attribute_id, is_active: IS_ACTIVE.ACTIVE }, transaction },
      );
    });
    return withSuccess(null);
  }
  /**
   * @summary Thay đổi trạng thái thuộc tính
   */
  @Put('/{id}/attribute/{attribute_id}/change-status')
  public async changeStatusAtrribute(
    id: number,
    attribute_id: number,
    @Request() request: any,
    @Body() body: { status: number },
  ): Promise<SuccessResponseModel<any>> {
    // Kiểm tra danh mục cha
    const category = await super._findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
    });
    // Kiểm tra thuộc tính
    if (!category) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const categoryAtrribute = await CategoryAttribute.findOne({
      where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(category);
    if (!categoryAtrribute) throw new AppError(apiCode.ATRRIBUTE_NOT_EXIST);

    const data = await CategoryAttribute.update(
      {
        status: body.status,
      },
      {
        where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
      },
    );
    return withSuccess(data);
  }
  /**
   * @summary Danh sach thuộc tính con
   */
  @Get('/{id}/attribute/{attribute_id}')
  public async detailAtrribute(
    attribute_id: number,
    id: number,
    @Request() request: any,
  ): Promise<SuccessResponseModel<any>> {
    // Kiểm tra danh mục cha
    const category = await super._findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
    });
    // Kiểm tra thuộc tính
    if (!category) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    const categoryAtrribute = await CategoryAttribute.findOne({
      where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(categoryAtrribute);
    if (!categoryAtrribute) throw new AppError(apiCode.ATRRIBUTE_NOT_EXIST);
    const data = await CategoryAttribute.findOne({
      where: { id: attribute_id, is_active: IS_ACTIVE.ACTIVE },
      include: [
        { model: AttributeOption, attributes: ['id', 'name', 'display_order'], where: { is_active: IS_ACTIVE.ACTIVE } },
      ],
    });
    return withSuccess(data);
  }
  /**
   * @summary Chi tiết danh mục
   */
  @Get('/{id}')
  public async getDetailCategory(id: number): Promise<SuccessResponseModel<any>> {
    const checkCategory = await super._findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    if (checkCategory == null) throw new AppError(apiCode.CATEGORY_NOT_EXIST);
    return withSuccess(checkCategory);
  }
}
