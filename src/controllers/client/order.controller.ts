import {
  IS_ACTIVE,
  apiCode,
  USER_STATUS,
  AppError,
  ORDER_STATUS_TYPE,
  PRODUCT_MEDIA_TYPE,
  ORDER_HISTORY_UPDATE_TYPE,
} from '@commons/constant';
import { ApplicationController } from '../';
import * as _ from 'lodash';
import Joi from '../../helpers/validationHelper';

import {
  Body,
  Controller,
  Get,
  Path,
  Request,
  Security,
  Post,
  Put,
  Patch,
  Query,
  Route,
  SuccessResponse,
  Delete,
  Tags,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
  PagingResponseModel,
} from '../models/BaseResponseModel';
import { AuthorizedUser } from '@commons/types';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware';
import * as express from 'express';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import { createOrder, order, order_detail } from '../mock/order';

const db = require('@models');
const getBaseUrl = (req: any) => `${req.protocol}://${req.headers.host}`;
interface MulterRequest extends express.Request {
  file: any;
}
const {
  sequelize,
  Sequelize,
  Order,
  DFShipmerchant,
  DFTypePayment,
  OrderItem,
  Enterprise,
  DFStatusOrder,
  DFStatusPayment,
  DFStatusShip,
  Customer,
  Agent,
  DFProvince,
  DFDistrict,
  DFWard,
  User,
  AgentShop,
  OrderHistory,
  Review,
  Product,
  ReviewMedia,
} = db.default;
const { Op } = Sequelize;

interface OrderItemPayload {
  id?: number;
  order_id?: number;
  product_id: number;
  price: number;
  agent_price: number;
  discount_price: number;
  product: Object;
  quantity: number;
}

interface OrderPayload {
  id?: number;
  code: string;
  customer_id: number;
  enterprise_id: number;
  ship_merchant_id: number;
  agent_id?: number;
  count_item: number;
  total_money: number;
  status_payment_id: number;
  status_order_id: number;
  status_ship_id: number;
  type_payment_id: number;
  type_ship: number;
  ship_fee: number;
  price: number;
  note?: string;
  commission: string;
}

interface OrderRequestModel {
  id?: number;
  code: string;
  customer_id: number;
  enterprise_id: number;
  ship_merchant_id: number;
  agent_id?: number;
  count_item: number;
  total_money: number;
  status_payment_id: number;
  status_order_id: number;
  status_ship_id: number;
  type_payment_id: number;
  type_ship: number;
  ship_fee: number;
  price: number;
  note?: string;
  commission: string;
  OrderItems: Array<any>;
}
@Route('agent-order')
@Tags('agent/order')
export class OrderController extends ApplicationController {
  constructor() {
    super('Order');
  }

  /**
   * @summary L???ch s??? tr???ng th??i ????n h??ng
   */
  @Security('jwt', ['agent'])
  @Get('/{order_id}/status-history')
  public async orderStatusHistory(order_id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const orderHistory = await OrderHistory.findAll({
      attributes: ['code', 'create_at'],
      where: { order_id: order_id, agent_id: 70, is_active: IS_ACTIVE.ACTIVE },
      include: [
        {
          model: DFShipmerchant,
          attributes: ['name'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
        {
          model: Order,
          attributes: ['code'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
        {
          model: DFStatusOrder,
          attributes: ['name'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
      ],
    });
    return withSuccess(orderHistory);
  }
  //   @Get('/')
  //   public async listOrder(
  //     @Request() request: any,
  //     @Query() status_payment_id?: number, //m???c ?????nh 1 l?? ch???n n???u 0 l?? kh??ng ch???n c??? 3 b???ng 0 ch???n th???ng c???n x??c nh???n
  //     @Query() status_order_id?: number, //status_payment_id || status_order_id || status_ship_id
  //     @Query() status_ship_id?: number, //status_payment_id || status_order_id || status_ship_id
  //   ): Promise<PagingResponseModel<any>> {
  //     return withSuccess(order);
  //   }
  //   /**
  //    * @summary th??m m???i ????n h??ng
  //    */
  //   //  @Security('jwt', ['agent'])
  //   @Post('/')
  //   public async createOrder(
  //     @Request() request: any,
  //     @Body()
  //     body: {
  //       stock_id: number;
  //       product_id: number;
  //       level_id?: number;
  //       agent_id?: number;
  //       product_price_id?: number;
  //       order_id?: number;
  //       total_money?: number;
  //       count_item?: number;
  //       custom_attribute_option_id_1?: number;
  //       custom_attribute_option_id_2?: number;
  //       code?: string;
  //       name?: string;
  //       quantity?: number;
  //       agent_price?: number;
  //       discount_price?: number;
  //     },
  //   ): Promise<SuccessResponseModel<any>> {
  //     return withSuccess(createOrder);
  //   }
  // /**
  //  * @summary S???a ????n h??ng
  //  */
  //   @Security('jwt', ['agent'])
  //   @Put('/{id}')
  //   public async updateCart(
  //     id: number,
  //     @Request() request: any,
  //     @Body()
  //     body: {
  //       stock_id: number;
  //       product_id: number;
  //       level_id?: number;
  //       agent_id?: number;
  //       product_price_id?: number;
  //       order_id?: number;
  //       total_money?: number;
  //       count_item?: number;
  //       custom_attribute_option_id_1?: number;
  //       custom_attribute_option_id_2?: number;
  //       code?: string;
  //       name?: string;
  //       quantity?: number;
  //       agent_price?: number;
  //       discount_price?: number;
  //     },
  //   ): Promise<SuccessResponseModel<any>> {
  //     return withSuccess(order_detail);
  //     // return this.getOrder({ order_detail }[0]);
  //   }

  /**
   * @summary DS ????n h??ng
   * status_order_id(required): x??c ?????nh lo???i h??a ????n(c???n x??c nh???n, ch??? ncc x??c nh???n, ???? x??c nh???n, ??ang giao)
   */
  @Security('jwt', ['agent'])
  @Get('/')
  public async getListOrders(
    @Request() request: any,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
    @Query('enterprise_id') enterprise_id?: number,
    @Query('status_order_id') status_order_id?: any,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      attributes: ['id'],
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const { id: agent_id } = agentId;

    const { offset, limit, page } = handlePagingMiddleware(request);
    const schema = Joi.object({
      from_date: Joi.date().allow(null, ''),
      to_date: Joi.date().allow(null, ''),
      enterprise_id: Joi.number().allow(null, ''),
      status_order_id: Joi.number().required().label('M?? tr???ng th??i h??a ????n'),
    });
    const {
      from_date: fromDate,
      to_date: toDate,
      enterprise_id: enterpriseId,
      status_order_id: statusOrderId,
    } = await schema.validateAsync({ from_date, to_date, enterprise_id, status_order_id });

    const whereOption: any = {
      status_order_id: !['', null].includes(status_order_id) ? [status_order_id] : Object.values(ORDER_STATUS_TYPE),
      agent_id: agent_id,
      is_active: IS_ACTIVE.ACTIVE,
    };
    if (!_.isNil(fromDate) && !_.isNil(toDate)) {
      whereOption.create_at = {
        [Op.lt]: toDate,
        [Op.gt]: fromDate,
      };
    }
    if (!_.isNil(enterpriseId)) {
      whereOption.enterprise_id = enterpriseId;
    }
    const joinOption: any = [
      {
        required: false,
        model: DFStatusPayment,
        attributes: ['id', 'name'],
        // as: 'status_payment',
      },
      {
        required: false,
        model: OrderItem,
        attributes: ['id', 'order_id', 'product_id', 'price', 'agent_price', 'discount_price', 'product', 'quantity'],
        as: 'OrderItems',
        where: { is_active: IS_ACTIVE.ACTIVE },
        limit: 1,
      },
      {
        required: false,
        model: DFStatusOrder,
        attributes: ['id', 'name'],
        // as: 'status_order',
      },
      {
        required: false,
        model: DFStatusShip,
        attributes: ['id', 'name'],
        // as: 'status_ship',
      },
    ];
    const { rows, count } = await Order.findAndCountAll({
      where: whereOption,
      attributes: [
        'id',
        'code',
        'customer_id',
        'enterprise_id',
        'agent_id',
        'ship_merchant_id',
        'total_money',
        'count_item',
        'create_at',
        'update_at',
      ],
      include: joinOption,
      limit,
      offset,
      logging: console.log,
    });
    return withPagingSuccess(rows, { page, limit, totalItemCount: _.isArray(count) ? count.length : count });
  }

  /**
   * @summary Chi ti???t ????n h??ng theo id
   */
  //   @Security('jwt', ['agent'])
  @Security('jwt', ['agent'])
  @Get('/{id_order}')
  public async getOrderDetail(@Request() request: any, id_order: number): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      attributes: ['id'],
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const { id: agent_id } = agentId;

    const schema = Joi.object({
      id: Joi.number().required().label('M?? h??a ????n'),
    });
    const { id } = await schema.validateAsync({ id: id_order });

    const joinOption: any = [
      {
        required: false,
        model: Agent,
        // as: 'Agent',
        attributes: ['id'],
        include: [
          {
            required: false,
            model: AgentShop,
            attributes: ['name', 'address', 'phone'],
            // as: 'AgentShop',
          },
        ],
      },
      {
        required: false,
        model: DFStatusPayment,
        attributes: ['id', 'name'],
        // as: 'status_payment',
      },
      {
        required: false,
        model: OrderItem,
        attributes: ['id', 'order_id', 'product_id', 'price', 'agent_price', 'discount_price', 'product', 'quantity'],
        as: 'OrderItems',
        where: { is_active: IS_ACTIVE.ACTIVE },
      },
      {
        required: false,
        model: DFStatusOrder,
        attributes: ['id', 'name'],
        // as: 'status_order',
      },
      {
        required: false,
        model: DFStatusShip,
        attributes: ['id', 'name'],
        // as: 'status_ship',
      },
      {
        required: false,
        model: Customer,
        attributes: ['id', 'name', 'phone'],
        include: [
          {
            required: false,
            model: DFProvince,
            attributes: ['id', 'name'],
            // as: 'df_province',
          },
          {
            required: false,
            model: DFDistrict,
            attributes: ['id', 'name'],
            // as: 'df_district',
          },
          {
            required: false,
            model: DFWard,
            attributes: ['id', 'name'],
            // as: 'df_wards_id',
          },
        ],
        as: 'Customer',
      },
    ];
    const res = await Order.findOne({
      where: { id: id, agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE },
      attributes: [
        'id',
        'code',
        'customer_id',
        'enterprise_id',
        'agent_id',
        'ship_merchant_id',
        'type_payment_id',
        'total_money',
        'count_item',
        'create_at',
        'update_at',
      ],
      include: joinOption,
      // logging: console.log,
    });
    return withSuccess(res);
  }

  /**
   * @summary S???a ????n h??ng theo id
   */
  @Security('jwt', ['agent'])
  @Put('/{id_order}')
  public async editOrder(
    @Request() request: any,
    @Body() body: OrderRequestModel,
    id_order: number,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({
      attributes: ['id'],
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const { id: agentId } = agent;

    const schema = Joi.object({
      id: Joi.number().integer().required(),
      code: Joi.string().required(),
      customer_id: Joi.number().integer().required(),
      enterprise_id: Joi.number().integer().required(),
      ship_merchant_id: Joi.number().integer().required(),
      agent_id: Joi.number().integer().required(),
      count_item: Joi.number().integer().required(),
      total_money: Joi.number().required(),
      status_payment_id: Joi.number().integer().required(),
      status_order_id: Joi.number().integer().required(),
      status_ship_id: Joi.number().integer().required(),
      type_payment_id: Joi.number().integer().required(),
      type_ship: Joi.number().integer().required(),
      ship_fee: Joi.number().required(),
      price: Joi.number().required(),
      note: Joi.string().allow(null, ''),
      commission: Joi.string().required(),
      OrderItems: Joi.array()
        .items(
          Joi.object()
            .keys({
              product_id: Joi.number().integer().required(),
              price: Joi.number().required(),
              agent_price: Joi.number().required(),
              discount_price: Joi.number().required(),
              product: Joi.object().required(),
              quantity: Joi.number(),
            })
            .unknown(true),
        )
        .required(),
    }).unknown(true);
    body.id = id_order;
    body.agent_id = agentId;
    const {
      id,
      code,
      customer_id,
      enterprise_id,
      ship_merchant_id,
      agent_id,
      count_item,
      total_money,
      status_payment_id,
      status_order_id,
      status_ship_id,
      type_payment_id,
      type_ship,
      ship_fee,
      price,
      note,
      commission,
      OrderItems,
    } = await schema.validateAsync(body);
    const data_transaction: any = await sequelize.transaction(async (transaction: any) => {
      const orderDataBeforeUpdate: OrderPayload = await Order.findOne({
        where: { id: id, agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE },
        transaction,
      });
      if (orderDataBeforeUpdate) {
        if (OrderItems.length !== 0) {
          await OrderItem.update(
            { is_active: IS_ACTIVE.INACTIVE },
            { where: { order_id: id, is_active: IS_ACTIVE.ACTIVE }, transaction },
          );
        }
        const listOrderItem: Array<OrderItemPayload> = OrderItems.map((item: OrderItemPayload) => {
          return {
            order_id: id,
            product_id: item.product_id,
            price: item.price,
            agent_price: item.agent_price,
            discount_price: item.discount_price,
            product: item.product,
            quantity: item.quantity,
          };
        });
        await OrderItem.bulkCreate(listOrderItem, { transaction });
        //
        const dataOrderHistory: any = {
          code: orderDataBeforeUpdate.code,
          customer_id: orderDataBeforeUpdate.customer_id,
          agent_id: orderDataBeforeUpdate.agent_id,
          count_item: orderDataBeforeUpdate.count_item,
          total_money: orderDataBeforeUpdate.total_money,
          status_payment_id: orderDataBeforeUpdate.status_payment_id,
          status_ship_id: orderDataBeforeUpdate.status_ship_id,
          status_order_id: orderDataBeforeUpdate.status_order_id,
          type_payment_id: orderDataBeforeUpdate.type_payment_id,
          type_ship: orderDataBeforeUpdate.type_ship,
          note: orderDataBeforeUpdate.note,
          enterprise_id: orderDataBeforeUpdate.enterprise_id,
          ship_merchant_id: orderDataBeforeUpdate.ship_merchant_id,
          ship_fee: orderDataBeforeUpdate.ship_fee,
          price: orderDataBeforeUpdate.price,
          commission: orderDataBeforeUpdate.commission,
          order_id: id,
          df_order_update_type_id: ORDER_HISTORY_UPDATE_TYPE.EDIT_ORDER,
        };
        // this.createOrderHistory(dataOrderHistory, transaction);
        await OrderHistory.create(dataOrderHistory, { transaction });
        const orderData: OrderPayload = {
          code,
          customer_id,
          enterprise_id,
          ship_merchant_id,
          agent_id,
          count_item,
          total_money,
          status_payment_id,
          status_order_id,
          status_ship_id,
          type_payment_id,
          type_ship,
          ship_fee,
          price,
          note,
          commission,
        };
        await Order.update(orderData, { where: { id: id, is_active: IS_ACTIVE.ACTIVE }, transaction });
        return { ...orderData, OrderItem: listOrderItem };
      } else {
        throw withError(apiCode.DATA_NOT_EXIST);
      }
    });
    return withSuccess(data_transaction);
  }

  /**
   * @summary H???y ????n h??ng, ch??? NCC x??c nh???n
   */
  @Security('jwt', ['agent'])
  @Put('cancel/wait-enterprise-confirmed/{id_order}')
  public async cancelOrder(@Request() request: any, id_order: number): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({
      attributes: ['id'],
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const { id: agent_id } = agent;

    const schema = Joi.object({
      id: Joi.number().required().label('M?? h??a ????n'),
    });
    const { id } = await schema.validateAsync({ id: id_order });
    const orderDataBeforeUpdate = await Order.findOne({
      where: { id: id, is_active: IS_ACTIVE.ACTIVE, agent_id: agent_id },
      logging: console.log,
    });
    if (!orderDataBeforeUpdate) {
      throw withError(apiCode.DATA_NOT_EXIST);
    }

    const { status_order_id } = orderDataBeforeUpdate;
    // enterprise confirm order
    if (status_order_id === ORDER_STATUS_TYPE.WAIT_ENTERPRISE_CONFIRMED_ORDER) {
      const data_transaction: any = await sequelize.transaction(async (transaction: any) => {
        await Order.update(
          { status_order_id: ORDER_STATUS_TYPE.CANCEL_ORDER },
          // { is_active: IS_ACTIVE.INACTIVE },
          { where: { id: id, agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE }, transaction },
        );
        console.log('update');
        // const orderDataBeforeUpdate: OrderPayload = await Order.findOne({
        //   where: { id: id },
        //   transaction,
        // });
        const dataOrderHistory: any = {
          code: orderDataBeforeUpdate.code,
          customer_id: orderDataBeforeUpdate.customer_id,
          agent_id: orderDataBeforeUpdate.agent_id,
          count_item: orderDataBeforeUpdate.count_item,
          total_money: orderDataBeforeUpdate.total_money,
          status_payment_id: orderDataBeforeUpdate.status_payment_id,
          status_ship_id: orderDataBeforeUpdate.status_ship_id,
          status_order_id: ORDER_STATUS_TYPE.WAIT_ENTERPRISE_CONFIRMED_ORDER,
          type_payment_id: orderDataBeforeUpdate.type_payment_id,
          type_ship: orderDataBeforeUpdate.type_ship,
          note: orderDataBeforeUpdate.note,
          enterprise_id: orderDataBeforeUpdate.enterprise_id,
          ship_merchant_id: orderDataBeforeUpdate.ship_merchant_id,
          ship_fee: orderDataBeforeUpdate.ship_fee,
          price: orderDataBeforeUpdate.price,
          commission: orderDataBeforeUpdate.commission,
          order_id: id,
          df_order_update_type_id: ORDER_HISTORY_UPDATE_TYPE.IGNORE_ORDER,
        };
        // this.createOrderHistory(dataOrderHistory, transaction);
        await OrderHistory.create(dataOrderHistory, { transaction });
        return { ...dataOrderHistory };
      });
      return withSuccess(data_transaction);
    } else {
      throw withError(apiCode.DATA_NOT_EXIST);
    }
  }

  /**
   * @summary x??c nh???n ????n h??ng(ch??a l??m)
   */
  @Security('jwt', ['agent'])
  @Put('confirm/{id_order}')
  public async confirmOrder(@Request() request: any, id_order: number): Promise<SuccessResponseModel<any>> {
    return withSuccess({});
  }

  /**
   * @summary ????nh gi?? ????n h??ng
   */
  @Security('jwt', ['agent'])
  @Put('/{id_order}/review')
  public async reviewOrder(
    @Request() request: any,
    @Body()
    body: {
      review: {
        product_id?: number;
        rating?: number;
        comment?: string;
        url?: string;
      }[];
    },
    id_order: number,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      attributes: ['id'],
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });

    const schema = Joi.object({
      review: Joi.array()
        .items(
          Joi.object()
            .keys({
              product_id: Joi.number().integer().required(),
              rating: Joi.number().allow('', null, 0, '0'),
              comment: Joi.string().allow('', null, 'null', ''),
              url: Joi.string().allow('', null, 'null', ''),
            })
            .unknown(true),
        )
        .required(),
    }).unknown(true);
    const { review } = await schema.validateAsync(body);
    const product_id = review.map((rate) => rate.product_id);
    const productReview = await Product.findAll({
      raw: true,
      attributes: [
        'id',
        'star',
        [
          Sequelize.literal(`(
            SELECT IFNULL(COUNT(review.id), 0)
            FROM review AS review
            WHERE review.product_id = product.id
                AND
                review.is_active = ${IS_ACTIVE.ACTIVE}
            )`),
          'count_star_vote',
        ],
        [
          Sequelize.literal(`IFNULL((
              SELECT SUM(star)
              FROM review AS review
              WHERE review.product_id = product.id
                AND
                review.is_active = ${IS_ACTIVE.ACTIVE}
          ),0)`),
          'sum_star',
        ],
      ],
      where: {
        id: { [Op.in]: product_id },
        is_active: IS_ACTIVE.ACTIVE,
      },
    });

    const checkReview = await Review.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, order_id: id_order } });
    if (checkReview) throw apiCode.REVIEW_EXIT;
    // return withSuccess(checkReview);
    // const url = review.map((rate) => ({ media_url: rate.url, review_id }));
    // // return withSuccess(url[1]);
    // if (url.length > 0) await Vote.bulkCreate(newRatingOrder, { transaction });
    const newReview = review.reduce((obj, item) => Object.assign(obj, { [item.product_id]: item.rating }), {});
    const newRatingOrder = review.map((element) => ({
      product_id: element.product_id,
      agent_id: agentId.id,
      star: element.rating,
      comment: element.comment,
      id_order,
      order_id: id_order,
    }));
    // return withSuccess(newRatingMedia);
    const newProductReview = productReview.map((product) => ({
      id: product.id,
      value: {
        star:
          Math.round(
            (10 * (parseInt(newReview[product.id]) + parseInt(product.sum_star))) /
              (1 + parseInt(product.count_star_vote)),
          ) / 10,
      },
    }));
    // const newReviews = await Review.findAll({ product_id: { [Op.in]: product_id }, is_active: IS_ACTIVE.ACTIVE });
    // const newRatingMedia = newReviews.forEach((item, index) => {
    //   review.map((element) => ({
    //     review_id: newReviews[index].id,
    //     id: element.url,
    //   }));
    // });
    // return withSuccess(newRatingMedia);
    // return withSuccess(newProductReview);
    if (newRatingOrder.length <= 0) {
      return withSuccess([]);
    }
    const data = await sequelize.transaction(async (transaction) => {
      const ids = await Review.bulkCreate(newRatingOrder, { transaction });
      console.log('review ids', ids);
      // const newReviews = await Review.findAll({ product_id: { [Op.in]: product_id }, is_active: IS_ACTIVE.ACTIVE });
      const reviewIds = review.flatMap((v) => v.url.split(','));
      // validate all ids in db
      const mediaDatas = review.flatMap((v, idx) => {
        return v.url.split(',').map((id) => ({ review_id: ids[idx].id, id: +id.trim(), media_url: '' }));
      });
      // validate: 1 media_id - 1 review_id
      console.log('mediadatas', mediaDatas);
      await ReviewMedia.bulkCreate(mediaDatas, { transaction, updateOnDuplicate: ['review_id'] });

      await Promise.all([
        newProductReview.map(async ({ id, value }) =>
          Product.update(value, { where: { id, is_active: IS_ACTIVE.ACTIVE }, transaction }),
        ),
        // newRatingMedia.map(async ({ review_id, id }) =>
        //   Product.update({ review_id: review_id }, { where: { id: { [Op.in]: id }, is_active: IS_ACTIVE.ACTIVE }, transaction })
        // )
      ]);
    });

    // Ki???m tra xem ????n h??ng ???? ???? ho??n th??nh hay ch??a
    // Ki???m tra xem ????n h??ng ???? ???? ????nh gi?? hay ch??a
    return withSuccess(data);
  }

  /**
   * @summary Upload ???nh order
   */
  @Post('uploadImageOrder')
  public async uploadImageOrder(@Request() request: express.Request): Promise<any> {
    const baseurl = getBaseUrl(request);
    // if (type == PRODUCT_MEDIA_TYPE.IMAGE) {
    //   await uploadMiddleware.handleSingleFile(request, 'image', type);
    // } else if (type == PRODUCT_MEDIA_TYPE.VIDEO) {
    //   await uploadMiddleware.handleSingleFile(request, 'video', type);
    // } else {
    //   throw new AppError(apiCode.INVALID_PARAM).with('Ki???u resource kh??ng h???p l???');
    // }
    await uploadMiddleware.handleSingleFile(request, 'image', PRODUCT_MEDIA_TYPE.IMAGE);
    // file will be in request.randomFileIsHere, it is a buffer
    const { file } = request as MulterRequest;
    if (!file) {
      throw new AppError(apiCode.UPLOAD_FAILED);
    }
    const { filename, fieldname, destination, path } = file;
    const url = `${baseurl}/${path}`;
    const data = await sequelize.transaction(async (transaction) => {
      const image = await ReviewMedia.create({ media_url: path, type: PRODUCT_MEDIA_TYPE.IMAGE, review_id: null });
      return image.id;
    });
    return withSuccess({ filename: filename, url: url, path, id: data });
  }
}
