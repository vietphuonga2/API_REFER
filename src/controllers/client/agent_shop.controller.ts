import { IS_ACTIVE, apiCode, USER_STATUS, AppError } from '@commons/constant';
import { ApplicationController } from '../';

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

import { agent_shop, agent_shop_detail } from '../mock/agent_shop';

const db = require('@models');

const { sequelize, Sequelize, Agent, AgentShop } = db.default;
const { Op } = Sequelize;

@Route('agent-shop')
@Tags('agent/shop')
export class AgentShopController extends ApplicationController {
  constructor() {
    super('AgentShop');
  }

  // @Security('jwt', ['agent'])
  // @Get('/')
  // public async getListAgentShop(@Request() request: any): Promise<SuccessResponseModel<any>> {
  //   const { offset, limit, page } = handlePagingMiddleware(request);
  //   const loggedInUser = request?.user?.data as AuthorizedUser;
  //   const agent = await Agent.findAndCountAll({ where: { user_id: loggedInUser.id } });

  //   const { rows, count } = await AgentShop.findOne({
  //     where: { agent_id: agent.id },
  //   });
  //   return withPagingSuccess(rows, { page, totalItemCount: count, limit });
  // }

  /**
   * @summary tìm kiếm Shop
   */
  @Security('jwt', ['agent'])
  @Get('/search')
  public async listAgentShop(
    @Request() request: any,
    @Query() search?: string,
  ): Promise<PagingResponseModel<any>> {
    //validate 
    // console.log(search)
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
    if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
    const schema = Joi.object({
      search: Joi.string().empty(['null', null, '', ""]),
    });
    const queryObj = await schema.validateAsync({ search });

    const { offset, limit, page } = handlePagingMiddleware(request);
    const { rows, count } = await AgentShop.findAndCountAll({

      where: {
        // name: { [Op.substring]: queryObj.search ? queryObj.search : { [Op.ne]: null } },
        name: { [Op.substring]: queryObj.search ? queryObj.search : "" },
        is_active: IS_ACTIVE.ACTIVE,
        agent_id: agent.id,
      },
      logging: true,
      limit,
      offset,
    });

    return withPagingSuccess(rows, { page, limit, totalItemCount: count });
  }

  /**
   * @summary thêm Shop
   */
  @Security('jwt', ['agent'])
  @Post('/')
  public async createAgentShop(
    @Request() request: any,
    @Body() body: {
      name: string;
      // phone: string;
      address?: any;
      location_address?: string;
      is_default: 1 | 0;
      lat?: number;
      long?: number;
    },
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
    if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
    const schema = Joi.object({
      name: Joi.string().empty(['null', null, '']).required(),
      address: Joi.string().empty(['null', null, '']),
      location_address: Joi.string().empty(['null', null, '']),
      lat: Joi.number().empty(['', null, 0, '0', ""]),
      long: Joi.number().empty(['', null, 0, '0', ""]),
    });
    const bodyData = await schema.validateAsync(body);
    const d = await sequelize.transaction(async (transaction) => {
      const d = await AgentShop.create(
        {
          name: bodyData.name,
          address: bodyData.address,
          agent_id: agent.id,
          location_address: bodyData.location_address,
          lat: bodyData.lat,
          long: bodyData.long,
        }, { transaction });
      if (body.is_default) {
        await Agent.update({ agent_shop_id: d.id }, { where: { id: agent.id }, transaction });
      }
      return d;
    });
    const data = await AgentShop.findOne({
      where: { id: d.id },
      include: [{ model: Agent, include: [{ model: AgentShop, as: 'default_shop' }] }],
    });
    return withSuccess(data);
  }
  /**
   * @summary Chi tiết Shop
   */
  @Security('jwt', ['agent'])
  @Get('/{id}')
  public async getAgentShop(@Request() request: any, id: number): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
    if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
    const checkAgentShop = await AgentShop.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    }); //check ID có isactive == 1
    if (!checkAgentShop) throw new AppError(apiCode.DATA_EXIST);

    const agentShop = await AgentShop.findOne({
      where: { id: id, is_active: IS_ACTIVE.ACTIVE, },
      agent_id: agent.id,
    });
    return withSuccess(agentShop);
    // return withSuccess(agent_shop);
  }
  /**
   * @summary Sửa Shop
   */
  @Security('jwt', ['agent'])
  @Put('/{id}')
  public async updateAgentShop(
    id: number,
    @Request() request: any,
    @Body()
    body: {
      name: string;
      // phone: string;
      address?: any;
      location_address?: string;
      is_default: 1 | 0;
      lat?: number;
      long?: number;
    },): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
    if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
    const schema = Joi.object({
      name: Joi.string().empty(['null', null, '']).required(),
      address: Joi.string().empty(['null', null, '']),
      location_address: Joi.string().empty(['null', null, '']),
      lat: Joi.number().empty(['', null, 0, '0', ""]),
      long: Joi.number().empty(['', null, 0, '0', ""]),
    });
    const bodyData = await schema.validateAsync(body);
    const updateAgentShop = await sequelize.transaction(async (transaction) => {
      await AgentShop.update(
        {
          name: bodyData.name,
          agent_id: agent.id,
          address: bodyData.address,
          location_address: bodyData.location_address,
          is_default: body.is_default,
          update_at: Date.now(),
        },
        {
          where: { id: id },
          transaction,
        },
      )
      if (body.is_default) {
        await Agent.update({ agent_shop_id: id }, { where: { id: agent.id }, transaction });
      }
    });
    const dataAgentShop = await AgentShop.findOne({
      where: { id: id },
      include: [{ model: Agent, include: [{ model: AgentShop, as: 'default_shop' }] }],
    });
    return withSuccess(dataAgentShop)
  }
  /**
   * @summary Xóa Shop
   */
  @Security('jwt', ['agent'])
  @Delete('/{id}')
  public async deleteAgentShop(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
    if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
    const angentShop = await AgentShop.findOne({ where: { is_active: IS_ACTIVE.ACTIVE, id: id } })
    if (!angentShop) throw new AppError(apiCode.DATA_NOT_EXIST);
    const deleteAll = await sequelize.transaction(async (transaction) => {
      await AgentShop.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
          update_at: Date.now(),
          delete_at: Date.now(),
        },
        {
          where: { id: id },
          transaction,
        },
      );
      if (Agent.agent_shop_id == id) {
        await Agent.update({ agent_shop_id: null }, { where: { id: agent.id }, transaction });
      }
    });
    return withSuccess(deleteAll);
    // return withSuccess(null);
  }
}
