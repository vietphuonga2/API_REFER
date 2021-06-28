import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  Request,
  SuccessResponse,
  Delete,
  Tags,
  Security,
} from 'tsoa';
import {
  SuccessResponseModel,
  PagingResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from './models/BaseResponseModel';
import { apiCode, IS_ACTIVE, GOOGLE_API_KEY, PLACE_TYPES, ROLE_NAMES, AppError } from '@commons/constant';
import { AuthorizedUser } from '@commons/types';

import { ApplicationController } from '.';
import { stock, stockDetail } from './mock/stocks';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware';
import Joi from '../helpers/validationHelper';

const db = require('@models');
const { sequelize, Sequelize, DFProvince, User, Enterprise, Stock, District, Ward, ProductStock } = db.default;
const { Op } = Sequelize;
const axios = require('axios');
const { parse } = require('node-html-parser');

@Route('stock')
@Tags('stock')
export class StockController extends ApplicationController {
  constructor() {
    super('Stock');
  }

  /**
   * @summary Danh sách kho enterprise
   * @param search
   * @param status
   * @param category_id
   * @param is_public
   */
  @Security('jwt', ['enterprise'])
  @Get('/')
  public async listStock(
    @Request() request: any,
    @Query() search?: string,
    @Query() status?: number,
    @Query() category_id?: number,
    @Query() is_public?: number,
    @Query() product_id?: number,
    @Query() array_stock_id?: string,
  ): Promise<PagingResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const paging = handlePagingMiddleware(request);

    const stockArr = JSON.parse(`[${array_stock_id}]`);
    const { rows, count } = await Stock.findAndCountAll({
      where: { is_active: IS_ACTIVE.ACTIVE, enterprise_id: loggedInUser.enterprise_id, id: { [Op.notIn]: stockArr } },
      include: {
        model: ProductStock,
        required: false,
        // required: product_id ? true : false,
        where: { is_active: IS_ACTIVE.ACTIVE, product_id: product_id ? product_id : { [Op.ne]: null } },
      },
      limit: paging.limit,
      offset: paging.offset,
    });
    return withPagingSuccess(rows, { page: paging.page, totalItemCount: count, limit: paging.limit });
  }

  /**
   * @summary lấy địa chỉ
   */
  // @Security('jwt', [ROLE_NAMES.ENTERPRISE])
  @Get('/place')
  public async getPlaceData(@Request() request: any, @Query() placeId?: string): Promise<PagingResponseModel<any>> {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${GOOGLE_API_KEY}&language=vi`,
    );

    if (!res.data.result) throw apiCode.NOT_FOUND;

    const html = parse(res.data.result.adr_address);
    const listPlace = html.childNodes;

    let province = '';
    let district = '';
    let ward = '';

    listPlace.forEach((item) => {
      if (item.childNodes.length > 0 && item.classNames.length > 0) {
        if (item.classNames.includes(PLACE_TYPES.PROVINCE)) province = item.childNodes[0].rawText;
        if (item.classNames.includes(PLACE_TYPES.DISTRICT)) {
          district = item.childNodes[0].rawText.split('.');

          district = district[district.length - 1];
        }
        if (item.classNames.includes(PLACE_TYPES.WARD)) {
          ward = item.childNodes[0].rawText.split(',');

          ward = ward[ward.length - 1];
        }
      }
    });
    const { lat, lng } = res.data.result.geometry.location;
    const address = res.data.result.formatted_address;

    return withSuccess({ lat, long: lng, address });
  }
  @Get('/place-auto')
  public async getPlaceAuto(@Request() request: any, @Query() address?: string): Promise<PagingResponseModel<any>> {
    let autoCompleteLink = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURI(
      address,
    )}&key=${GOOGLE_API_KEY}&language=vi&components=country:vn`;

    let res = await axios.get(autoCompleteLink);

    if (res.data.predictions.length > 0) return withSuccess(res.data);

    throw apiCode.NOT_FOUND;
  }

  /**
   * @summary Tạo địa chỉ kho hàng
   */
  @Security('jwt', ['enterprise'])
  @Post('/')
  public async createStock(
    @Request() request: any,
    @Body()
    body: {
      name: string;
      address: string;
      df_province_id: number;
      df_district_id: number;
      df_ward_id: number;
      lat: number;
      long: number;
    },
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(loggedInUser);
    const schema = Joi.object({
      name: Joi.string(),
      address: Joi.string().required().label('Tên'),
      df_province_id: Joi.number().empty(['', null, 'null']).required(),
      df_district_id: Joi.number().empty(['', null, 'null']).required(),
      df_ward_id: Joi.number().empty(['', null, 'null']).required(),
      lat: Joi.number(),
      long: Joi.number(),
      // enterprise_id: Joi.number().empty(['null', 'undefined']).required(),
    });
    const bodyData = await schema.validateAsync(body);
    bodyData.enterprise_id = loggedInUser.enterprise_id;
    bodyData.create_by = loggedInUser.id;

    const data = await Stock.findAll({
      where: {
        name: { [Op.substring]: bodyData.name },
        enterprise_id: bodyData.enterprise_id,
        is_active: IS_ACTIVE.ACTIVE,
      },
    });

    // return withSuccess(data);

    if (data.length > 0) throw apiCode.STOKE_NOT_FOUND;

    const createdStock = await Stock.create(bodyData);
    return withSuccess(createdStock);
  }

  @Security('jwt', [ROLE_NAMES.ENTERPRISE])
  @Delete('/{id}')
  public async deleteStock(@Request() request, id: number): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    await Stock.update(
      { is_active: IS_ACTIVE.INACTIVE, delete_at: new Date(), delete_by: loggedInUser.id },
      { where: { id } },
    );
    return withSuccess({});
  }
}
