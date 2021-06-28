import { Get, Route, Security, Response, Request, Post, Tags, Body, Query, Put, Delete } from 'tsoa';
import * as express from 'express';
import * as multer from 'multer';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import { withSuccess, withPagingSuccess } from './models/BaseResponseModel';
import { BannerRequestModel, BasicBannerSchema } from './models/BannerModel';
import {
  apiCode,
  IS_ACTIVE,
  PRODUCT_ORDER_TYPE,
  PRODUCT_MEDIA_TYPE,
  AppError,
  PRODUCT_STATUS,
  BANNER_STATUS,
} from '@commons/constant';
import { AuthorizedUser } from '@commons/types';
import Joi from '../helpers/validationHelper';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware'; //Pagination
import { ApplicationController } from './';

const getBaseUrl = (req: any) => `${req.protocol}://${req.headers.host}`;
const db = require('@models');
const { sequelize, Sequelize, Banner, Product } = db.default;
const { Op } = Sequelize;

// interface MulterRequest extends express.Request {
//   file: any;
// }
@Security('jwt', ['enterprise'])
@Route('banner')
@Tags('Banner')
export class BannerController {
  /**
   * @summary Thêm banner
   */
  @Post('/')
  public async createBanner(
    @Request() request,
    @Body()
    body: BannerRequestModel,
  ): Promise<any> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const bodyData = await BasicBannerSchema.validateAsync(body, {
      allowUnknown: false,
    });
    // return withSuccess(bodyData);
    const banner = await sequelize.transaction(async (transaction) => {
      const banner = await Banner.create(
        {
          title: bodyData.title,
          media_url: bodyData.media_url,
          enterprise_id: loggedInUser.enterprise_id,
          description: bodyData.description,
          gift_hunting_status: bodyData.gift_hunting_status,
          gift_code: bodyData.gift_code,
          time_hunting: bodyData.time_hunting || null,
          product_id: bodyData.product_id || null,
          type: bodyData.type,
        },
        { transaction },
      );
    });
    return withSuccess(banner);
  }
  /**
   * @summary Sửa banner
   */
  @Put('/{id}')
  public async updateBanner(
    id: number,
    @Request() request,
    @Body()
    body: BannerRequestModel,
  ): Promise<any> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const bodyData = await BasicBannerSchema.validateAsync(body, {
      allowUnknown: false,
    });
    // return withSuccess(bodyData);
    const banner = await sequelize.transaction(async (transaction) => {
      const banner = await Banner.update(
        {
          title: bodyData.title,
          media_url: bodyData.media_url,
          enterprise_id: loggedInUser.enterprise_id,
          description: bodyData.description,
          gift_hunting_status: bodyData.gift_hunting_status,
          gift_code: bodyData.gift_code,
          time_hunting: bodyData.time_hunting || null,
          product_id: bodyData.product_id || null,
          type: bodyData.type,
        },
        { where: { id, is_active: IS_ACTIVE.ACTIVE }, transaction },
      );
    });
    return withSuccess(banner);
  }

  /**
   * @summary Xóa banner
   */
  @Delete('/{id}')
  public async deleteBanner(id: number, @Request() request): Promise<any> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(bodyData);
    const banner = await sequelize.transaction(async (transaction) => {
      const banner = await Banner.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
        },
        { where: { id, is_active: IS_ACTIVE.ACTIVE }, transaction },
      );
    });
    return withSuccess(banner);
  }

  /**
   * @summary Danh sách banner
   */
  @Get('/')
  public async getListBanner(
    @Request() request,
    @Query() search?: string,
    @Query() status?: any,
    @Query() from_date?: any,
    @Query() to_date?: any,
    // @Body()
    // body: BannerRequestModel,
  ): Promise<any> {
    const schema = Joi.object({
      search: Joi.string().empty(['null', null, '']),
      status: Joi.number().empty(Joi.not(...Object.values(BANNER_STATUS))),
    });
    const validateObj = await schema.validateAsync({ search, status });
    if (from_date != undefined) {
      from_date = new Date(from_date);
    } else from_date = 0;
    if (to_date != undefined) {
      to_date = new Date(new Date(to_date).setDate(new Date(to_date).getDate() + 1));
    } else to_date = new Date(Date.now());
    const { offset, limit, page } = handlePagingMiddleware(request);
    let where;
    if (search) {
      where = {
        name: { [Op.substring]: search ? search : { [Op.ne]: null } },
        is_active: IS_ACTIVE.ACTIVE,
      };
    }

    const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(bodyData);
    const { count, rows } = await Banner.findAndCountAll({
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        status: validateObj.status != undefined ? validateObj.status : { [Op.in]: Object.values(BANNER_STATUS) },
      },
      include: {
        model: Product,
        required: false,
        where: { is_active: IS_ACTIVE.ACTIVE, status: PRODUCT_STATUS.ACTIVE },
      },
      limit,
      offset,
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }

  /**
   * @summary Chi tiết banner
   */
  @Get('/{id}')
  public async detailBanner(
    id: number,
    @Request() request,
    // @Body()
    // body: BannerRequestModel,
  ): Promise<any> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(bodyData);
    const banner = await Banner.findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
      include: {
        model: Product,
        required: false,
        where: { is_active: IS_ACTIVE.ACTIVE, status: PRODUCT_STATUS.ACTIVE },
      },
    });
    return withSuccess(banner);
  }
}
