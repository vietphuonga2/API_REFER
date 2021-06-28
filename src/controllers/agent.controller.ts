import { Body, Controller, Get, Path, Post, Put, Query, Route, Request, Delete, Tags, Security } from 'tsoa';
import * as _ from 'lodash';
import Joi from '../helpers/validationHelper';

import {
  SuccessResponseModel,
  PagingResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from './models/BaseResponseModel';

import { handlePagingMiddleware } from '@middleware/pagingMiddleware'; //Pagination
import { ApplicationController } from './';

import {
  AppError,
  apiCode,
  IS_ACTIVE,
  AGENT_ENTERPRISE_STATUS,
  GENDER,
  ROLE,
  AGENT_TYPE,
  USER_STATUS,
} from '@commons/constant';

import { AgentGeneralRequestModel, BasicUserSchema, DateJoi, PasswordSchema } from './models/AgentModel';
import * as express from 'express';
import { AuthorizedUser } from '@commons/types';
import { agent } from './mock/enterprises';
import { object } from 'joi';

const getBaseUrl = (req: any) => `${req.protocol}://${req.headers.host}`;

const db = require('@models');
const { sequelize, Sequelize, Agent, DFProvince, User, Wallet, Level, AgentEnterprise, Enterprise, WalletHistory } =
  db.default;
const { Op } = Sequelize;

@Route('agent')
@Tags('agent')
export class AgentController extends ApplicationController {
  constructor() {
    super('Agent');
  }
  // lấy dữ liệu data của các bảng
  public async getData(id: number) {
    const dt = await User.findOne({
      where: { id },
      include: [
        {
          model: Agent,
          // attributes: ["id", "user_id"],
          where: { is_active: IS_ACTIVE.ACTIVE },
          include: [
            {
              model: Wallet,
              // attributes: ["id", "ballance"],
              where: { is_active: IS_ACTIVE.ACTIVE },
            },
            {
              model: AgentEnterprise,
              where: { is_active: IS_ACTIVE.ACTIVE },
            },
          ],
        },
      ],
    });
    return withSuccess(dt);
  }
  /**
   * @summary Thêm mới CTV
   */

  @Security('jwt', ['enterprise'])
  @Post('/')
  public async createAgent(
    @Request() request: any,
    @Body()
    body: {
      email: string;
      name: string;
      phone: string;
      gender?: number;
      address?: string;
      province_id?: number;
      id_number?: string;
      // referal_id?: string;
      date_of_birth?: string;
      password?: string;
      level_id?: number;
    },
    // AgentGeneralRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    console.log(body.address);
    const bodyData = await BasicUserSchema.concat(PasswordSchema).validateAsync({
      ...body,
      df_type_user_id: ROLE.AGENT,
    });
    const user = await User.findOne({
      where: { user_name: bodyData.phone, is_active: IS_ACTIVE.ACTIVE },
    });

    if (user) throw new AppError(apiCode.ACCOUNT_EXIST);
    const created = await sequelize.transaction(async (transaction) => {
      const user = await User.create(
        {
          user_name: bodyData.phone,
          df_type_user_id: ROLE.AGENT,
          phone: bodyData.phone,
          password: bodyData.password,
          name: bodyData.name,
          email: bodyData.email,
          date_of_birth: bodyData.date_of_birth,
          gender: bodyData.gender,
          address: bodyData.address,
          province_id: bodyData.province_id,
          enterprise_id: loggedInUser.enterprise_id,
          // id_number: bodyData.id_number,
        },
        { transaction },
      );
      const wallet = await Wallet.create(
        {
          ballance: 0,
          is_active: IS_ACTIVE.ACTIVE,
          create_at: Date.now(),
          update_at: Date.now(),
          version: 0,
        },
        { transaction },
      );

      const _agent = await Agent.create(
        {
          user_id: user.id,
          // referal_agent_id: bodyData.referal_id,
          id_number: bodyData.id_number,
          wallet_id: wallet.id, //
        },
        { transaction },
      );
      const agent_enterprise = await AgentEnterprise.create(
        {
          // enterprise_id: loggedInUser.df_type_user_id,
          enterprise_id: loggedInUser.enterprise_id,
          agent_id: _agent.id,
          type: AGENT_TYPE.CONTRACT,
          level_id: bodyData.level_id,
        },
        { transaction },
      );
      return user.id;
    });
    const createdAgent = await User.findOne({
      where: { id: created },
      include: [
        {
          model: Agent,
          // attributes: ["id", "user_id"],
          where: { is_active: IS_ACTIVE.ACTIVE },
          include: [
            {
              model: Wallet,
              // attributes: ["id", "ballance"],
              where: { is_active: IS_ACTIVE.ACTIVE },
            },
            {
              model: AgentEnterprise,
              where: { is_active: IS_ACTIVE.ACTIVE },
            },
          ],
        },
      ],
    });

    // // const schema = Joi.object({
    // //   province_id: Joi.number().empty(['null', 'undefined']),
    // //   total_product: Joi.number().empty(['null', 'undefined']),
    // //   total_order: Joi.number().empty(['null', 'undefined']),
    // //   gender: Joi.number()
    // //     .valid(...Object.values(GENDER))
    // //     .required(),
    // //   id_number: Joi.string().required().label('Số CCCD/CMTND'),
    // //   wallet_id: Joi.number().empty(['null', 'undefined']),
    // //   referal_agent_id: Joi.number().empty(['null', 'undefined']),
    // // });

    // // const bodyDt = await schema.validateAsync(body, { allowUnknown: false, convert: true }); //bắt đầu chạy
    // // const _agent = await super._findOne({
    // //   where: {
    // //     id_number: body.id_number,
    // //     is_active: IS_ACTIVE.ACTIVE,
    // //     create_at: Date.now(),
    // //   },
    // // });
    // // if (_agent) {
    // //   throw new AppError(apiCode.DATA_EXIST);
    // // }
    // const createdAgent = await Agent.create(bodyDt);
    // return withSuccess(createdAgent);
    return withSuccess(createdAgent);
  }

  /**
   * @summary Sửa CTV
   */
  // @Security('jwt', ['enterprise'])
  @Put('/{id}')
  public async updateAgent(
    id: number,
    @Request() request: any,
    @Body()
    body: {
      email: string;
      name: string;
      phone: string;
      gender?: number;
      address?: any;
      province_id?: number;
      id_number?: any;
      // referal_id?: string;
      date_of_birth?: string;
      level_id?: number;
    },
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    const bodyData = await BasicUserSchema.validateAsync({
      ...body,
      df_type_user_id: ROLE.AGENT,
    });
    let checkIdAgent;
    let checkIdUser;
    let checkIdWallet;
    let checkIdAgentEnterprise;
    Promise.all([
      (checkIdAgent = await Agent.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: id },
      })),
      (checkIdUser = await User.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: checkIdAgent.user_id },
      })),
      (checkIdWallet = await Wallet.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: checkIdAgent.wallet_id },
      })),
      (checkIdAgentEnterprise = await AgentEnterprise.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, agent_id: id },
      })),
    ]);
    const updateAll = await sequelize.transaction(async (transaction) => {
      await User.update(
        {
          email: bodyData.email,
          name: bodyData.name,
          phone: bodyData.phone,
          gender: bodyData.gender,
          address: bodyData.address,
          province_id: bodyData.province_id,
        },
        {
          where: { id: checkIdAgent.user_id },
          transaction,
        },
      );
      await Agent.update(
        {
          id_number: bodyData.id_number,
          // referal_id: bodyData.referal_id,
        },
        {
          where: { id },
          transaction,
        },
      );
      // await Wallet.update(
      //   {
      //     where: { id: checkIdAgent.wallet_id },
      //     transaction
      //   }
      // );
      await AgentEnterprise.update(
        {
          level_id: bodyData.level_id,
        },
        {
          where: { id: checkIdAgentEnterprise.id },
          transaction,
        },
      );
      return checkIdUser.id;
    });
    return this.getData(updateAll);
  }

  /**
   * @summary Xóa CTV
   */
  @Delete('/{id}')
  public async deleteAgent(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
    let checkIdAgent;
    let checkIdUser;
    let checkIdWallet;
    let checkIdAgentEnterprise;
    Promise.all([
      (checkIdAgent = await Agent.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: id },
      })),
      (checkIdUser = await User.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: checkIdAgent.user_id },
      })),
      (checkIdWallet = await Wallet.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, id: checkIdAgent.wallet_id },
      })),
      (checkIdAgentEnterprise = await AgentEnterprise.findOne({
        where: { is_active: IS_ACTIVE.ACTIVE, agent_id: id },
      })),
    ]);

    if (!checkIdAgent || !checkIdUser || !checkIdWallet || !checkIdAgentEnterprise)
      throw new AppError(apiCode.DATA_NOT_EXIST);

    const deleteAll = await sequelize.transaction(async (transaction) => {
      await User.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
        },
        {
          where: { id: checkIdAgent.user_id },
          transaction,
        },
      );
      await Agent.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
        },
        {
          where: { id: id },
          transaction,
        },
      );
      await Wallet.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
        },
        {
          where: { id: checkIdAgent.wallet_id },
          transaction,
        },
      );
      await AgentEnterprise.update(
        {
          is_active: IS_ACTIVE.INACTIVE,
        },
        {
          where: { id: checkIdAgentEnterprise.id },
          transaction,
        },
      );
    });
    // const checkId = await super._findOne({
    //   where: { is_active: IS_ACTIVE.ACTIVE, id },
    // });
    // if (!checkId) throw new AppError(apiCode.DATA_EXIST);
    // const data = await super._update(
    //   {
    //     is_active: IS_ACTIVE.INACTIVE,
    //   },
    //   {
    //     where: { id: id, is_active: IS_ACTIVE.ACTIVE },
    //   },
    // );
    // return withSuccess(data);
    return withSuccess(deleteAll);
  }
  /**
   * @summary chi tiết CTV
   */
  @Get('/{id}')
  public async getDetailAgent(id: number): Promise<SuccessResponseModel<any>> {
    const checkId = await Agent.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    }); //check ID có isactive == 1
    if (checkId == null) throw new AppError(apiCode.DATA_EXIST);

    const dt_all = await User.findOne({
      where: { id: checkId.user_id },
      include: {
        model: Agent,
        // attributes: ["id", "user_id"],
        where: { is_active: IS_ACTIVE.ACTIVE },
        include: [
          {
            model: Wallet,
            required: false,
            // attributes: ["id", "ballance"],
            where: { is_active: IS_ACTIVE.ACTIVE },
            // include:
            // {
            //   required: false,
            //   model: WalletHistory,
            //   // as: "last_wallet_history",
            //   where: { is_active: IS_ACTIVE.ACTIVE },
            // }
          },
          {
            model: AgentEnterprise,
            required: false,
            where: { is_active: IS_ACTIVE.ACTIVE },
          },
        ],
      },
    });
    // const data = await Agent.findOne(
    //   {
    //     is_active: IS_ACTIVE.INACTIVE,
    //   },
    //   {
    //     where: { id: id, is_active: IS_ACTIVE.ACTIVE },
    //   },
    // );
    return withSuccess(dt_all);
  }
  /**
   * @summary Tìm kiếm CTV
   */
  @Get('/')
  public async listAgent(
    @Request() request: any,
    @Query() search?: string,
    @Query() status?: any,
    @Query() province_id?: any,
    @Query() type?: any,
    @Query() from_date?: any,
    @Query() to_date?: any,
  ): Promise<PagingResponseModel<any>> {
    //validate
    const schema = Joi.object({
      search: Joi.string().empty(['null', null, '']),
      status: Joi.number().empty(Joi.not(...Object.values(USER_STATUS))),
    });
    const queryObj = await schema.validateAsync({ search, status });
    // const f_date = new Date(from_date || 0).getTime();
    // const t_date = new Date(to_date || Date.now() / 1000).getTime();

    // let { from_date, to_date } = request.query;

    // return withSuccess({ from_date, to_date });
    // let fromDate;
    // let toDate;

    // from_date = new Date(from_date || 0).getTime();
    // to_date = new Date(to_date).setDate(new Date(to_date).getDate() + 1);
    if (from_date != undefined) {
      from_date = new Date(from_date);
    } else from_date = 0;
    if (to_date != undefined) {
      to_date = new Date(new Date(to_date).setDate(new Date(to_date).getDate() + 1));
    } else to_date = new Date(Date.now());

    // from_date = from_date ? new Date(from_date) : 0;
    // to_date = to_date ? new Date(new Date(to_date).setDate(new Date(to_date).getDate() + 1)) : new Date(Date.now());

    // from_date = new Date(from_date).getTime();
    // to_date = new Date(to_date).getTime();
    // return withSuccess({ from_date, to_date });
    // return withSuccess(type);
    // const t_date: any = to_date ? to_date : Date.now();
    const { offset, limit, page } = handlePagingMiddleware(request);
    // const bodyData = await DateJoi.validateAsync({
    //   Date,
    // });
    let whereUser;
    if (search) {
      whereUser = {
        [Op.or]: [
          { name: { [Op.substring]: search ? search : { [Op.ne]: null } } },
          { phone: { [Op.substring]: search ? search : { [Op.ne]: null } } },
        ],
        is_active: IS_ACTIVE.ACTIVE,
      };
    }
    const { rows, count } = await Agent.findAndCountAll({
      include: [
        {
          model: User,
          required: true,
          where: [
            {
              // status: { [Op.in]: !_.isNil(status) ? [status] : Object.values(USER_STATUS) },
              // },
              // {
              // ...(!_.isNil(queryObj.status) && { status: status }),
              status: queryObj.status != undefined ? queryObj.status : { [Op.in]: Object.values(USER_STATUS) },
              df_type_user_id: type ? type : { [Op.ne]: null },
            },
            whereUser,
          ],
        },
        {
          model: AgentEnterprise,
          required: false,
          where: {
            is_active: IS_ACTIVE.ACTIVE,
          },
          include: [
            {
              model: Level,
              where: { is_active: IS_ACTIVE.ACTIVE },
            },
          ],
        },
      ],
      where: {
        province_id: province_id ? province_id : { [Op.eq]: null },
        create_at: {
          [Op.and]: [{ [Op.gte]: from_date }, { [Op.lt]: to_date }],
        },
        is_active: IS_ACTIVE.ACTIVE,
      },
      logging: true,
      limit,
      offset,
    });
    // return withSuccess(type);

    return withPagingSuccess(rows, { page, limit, totalItemCount: count });
  }
  /**
   * @summary Tìm kiếm wallet_history
   */
  @Get('/{id}/wallet_history')
  public async listWalletHistory(
    id: number,
    @Request() request: any,
    @Query() from_date?: any,
    @Query() to_date?: any,
    @Query() transaction_mode?: number,
  ): Promise<PagingResponseModel<any>> {
    if (from_date != undefined) {
      from_date = new Date(from_date);
    } else from_date = 0;
    if (to_date != undefined) {
      to_date = new Date(new Date(to_date).setDate(new Date(to_date).getDate() + 1));
    } else to_date = new Date(Date.now());
    const checkId = await Agent.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id },
    });
    if (checkId == null) throw new AppError(apiCode.DATA_EXIST);
    const { offset, limit, page } = handlePagingMiddleware(request);
    const { rows, count } = await Wallet.findAndCountAll({
      where: {
        id: checkId.wallet_id,
        is_active: IS_ACTIVE.ACTIVE,
      },
      include: {
        model: WalletHistory,
        where: {
          is_active: IS_ACTIVE.ACTIVE,
          transaction_mode: transaction_mode,
          create_at: {
            [Op.and]: [{ [Op.gte]: from_date }, { [Op.lt]: to_date }],
          },
        },
      },
      logging: true,
      limit,
      offset,
    });
    return withPagingSuccess(rows, { page, limit, totalItemCount: count });
  }
}
