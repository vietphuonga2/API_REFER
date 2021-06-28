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
import {
  IS_ACTIVE,
  apiCode,
  USER_STATUS,
  ROLE,
  GENDER,
  CONFIG,
  PRODUCT_MEDIA_TYPE,
  ROLE_NAMES,
  AppError,
} from '@commons/constant';
import { ApplicationController } from '..';
import { AuthorizedUser } from '@commons/types';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import * as express from 'express';
import { category, atrribute, atrributeDetail } from '../mock/category';
import Joi from '../../helpers/validationHelper';
import { required, string } from 'joi';
import { enterprises } from '@controllers/mock/enterprises';
import { getBaseServer } from '@helpers/requestHelper';

const db = require('@models');
const {
  Role,
  DFProvince,
  sequelize,
  Sequelize,
  User,
  Category,
  Enterprise,
  ProductMedia,
  ProductCustomAttribute,
  ProductCustomAttributeOption,
  Wishlist,
  AgentProductMedia,
  ProductPrice,
  Agent,
  Product,
  AgentProduct,
  Stock,
  AgentEnterprise,
  Banner,
} = db.default;
const { Op } = Sequelize;
interface ProductMulterRequest extends express.Request {
  file: any;
}

/**
 * Danh mục sản phẩm
 */

@Route('client/home')
@Tags('client/home')
export class HomeController extends ApplicationController {
  constructor() {
    super('Home');
  }

  /**
   * @summary Màn hình trang chủ
   */
  @Get('/')
  public async detailProductAgent(
    @Request() request: any,
    @Query('search') search?: string,
  ): Promise<SuccessResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);
    let listCategory;
    let listBanner;
    let listCharts;
    let listProduct;
    // let listTopProduct;
    let whereOption;
    whereOption = {
      name: search ? { [Op.substring]: search } : { [Op.ne]: null },
      is_active: IS_ACTIVE.ACTIVE,
    };
    Promise.all([
      (listCategory = await Category.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, parent_id: null } })),
      (listProduct = await Product.findAll({ where: whereOption })),
      (listBanner = await Banner.findAll({ where: { is_active: IS_ACTIVE.ACTIVE } })),
    ]);

    return withSuccess({ listCategory, listProduct, listBanner });
  }
}
