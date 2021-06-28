import { IS_ACTIVE, apiCode, USER_STATUS, AppError } from '@commons/constant';
import { ApplicationController } from '..';
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

const db = require('@models');

const {
  sequelize,
  Sequelize,
  Cart,
  Agent,
  AgentCart,
  ProductPrice,
  Product,
  ProductCustomAttributeOption,
  User,
  Enterprise,
  Stock,
  DFStatusOrder,
} = db.default;
const { Op } = Sequelize;

@Route('df-status-order')
@Tags('agent/status-order')
export class DFStatusOrderController extends ApplicationController {
  constructor() {
    super('DFStatusOrder');
  }

  /**
   * @summary Thêm mới trạng thái đơn hàng
   */
  // @Security('jwt', ['agent'])
  @Security('jwt')
  @Post('/')
  public async createStatusOrder(
    @Request() request: any,
    @Body()
    body: {
      name: string;
      value: string;
    },
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    console.log('loggedInUser', loggedInUser);
    const _agent = await Agent.findOne({
      where: { user_id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    console.log('_agent', _agent);
    // if (!_agent) throw new AppError(apiCode.REASON_AGENT_EXITS);

    const schema = Joi.object({
      name: Joi.string().empty(['null', null, '']).required(),
      value: Joi.string().empty(['null', null, '']).required(),
    });

    const bodyData = await schema.validateAsync(body);
    try {
      const createdStatusOrder = await DFStatusOrder.create(bodyData);
      return withSuccess(createdStatusOrder);
    } catch (error) {
      throw withError(error);
    }
    // return withSuccess(cart);
  }

  /**
   * @summary Lấy tất cả trạng thái đơn hàng
   */
  // @Security('jwt', ['agent'])
  @Security('jwt')
  @Get('/')
  public async getStatusOrders(
    @Request() request: any,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      from_date: Joi.date().allow(null, ''),
      to_date: Joi.date().allow(null, ''),
    });
    const { from_date: fromDate, to_date: toDate } = await schema.validateAsync({ from_date, to_date });

    try {
      if (!_.isNil(fromDate) && !_.isNil(toDate)) {
        const listStatusOrder = await DFStatusOrder.findAndCountAll({
          where: {
            create_at: {
              [Op.lt]: toDate,
              [Op.gt]: fromDate,
            },
          },
          // attributes: [],
          logging: console.log,
        });
        console.log('full params', listStatusOrder);
        return withSuccess(listStatusOrder);
      } else {
        const listStatusOrder = await DFStatusOrder.findAndCountAll({
          // attributes: [],
          logging: console.log,
        });
        console.log('no params', listStatusOrder);
        return withSuccess(listStatusOrder);
      }
    } catch (error) {
      throw withError(error);
    }
  }
}
