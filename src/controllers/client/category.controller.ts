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
} from '../models/BaseResponseModel';
import { handlePagingMiddleware, pagingMiddleware } from '@middleware/pagingMiddleware';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG } from '@commons/constant';
import { ApplicationController } from '../';
import { category, atrribute, atrributeDetail } from '../mock/category';
import Joi from '../../helpers/validationHelper';
import { required } from 'joi';
import { enterprises } from '@controllers/mock/enterprises';

const db = require('@models');
const { Role, DFProvince, sequelize, Sequelize, User, Category, CategoryAttribute, AttributeOption, Wishlist, Agent } =
  db.default;
const { Op } = Sequelize;

interface CategoryRequestModel {
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
@Route('client/category')
@Tags('client/category')
export class ClientCategoryController extends ApplicationController {
  constructor() {
    super('Category');
  }
  /**
   * @summary Danh sách danh mục sản phẩm
   */
  @Get('/')
  public async listCategory(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    // return withSuccess(1);
    const { offset, limit, page } = handlePagingMiddleware(request);
    const { count, rows } = await Category.findAndCountAll({
      attributes: ['id', 'name'],
      where: { is_active: IS_ACTIVE.ACTIVE, parent_id: null },
      include: {
        model: CategoryAttribute,
        required: false,
        attributes: ['id', 'name'],
        where: { is_active: IS_ACTIVE.ACTIVE },
        include: {
          model: AttributeOption,
          required: false,
          attributes: ['id', 'name'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
      },
      page,
      offset,
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }
  /**
   * @summary Danh sach danh mục sản phẩm quan tâm
   */
  @Get('/wishlist-category/{agent_id}')
  public async listMyCategory(
    agent_id: number,
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    // return withSuccess(1);
    const { offset, limit, page } = handlePagingMiddleware(request);
    const { count, rows } = await Wishlist.findAndCountAll({
      where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agent_id },
      include: [
        {
          model: Category,
          required: false,
          attributes: ['id', 'name', 'display_order'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
      ],
      page,
      offset,
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit: CONFIG.PAGING_LIMIT });
  }
}
