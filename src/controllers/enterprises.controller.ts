import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags,
  Delete,
  Request,
  Security,
  TsoaResponse,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from './models/BaseResponseModel';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware';
import * as enterpriseService from '../services/enterprises.service';

import Joi from '../helpers/validationHelper';
import * as moment from 'moment';

import {
  AppError,
  IS_ACTIVE,
  AGENT_ENTERPRISE_STATUS,
  GENDER,
  AGENT_TYPE,
  ENTERPRISE_STATUS,
  CONFIG,
  ROLE,
  apiCode,
} from '@commons/constant';
import { ApplicationController } from './';
import { enterprises, users, usersDetail, agentInfo, agent } from './mock/enterprises';
const db = require('@models');
const { sequelize, Sequelize, DFProvince, User, Enterprise, Wallet } = db.default;
const { Op } = Sequelize;
import { UserRequestModel } from './models/UserRequestModel';
import { AuthorizedUser } from '@commons/types';

interface EnterpriseRequestModel {
  name: string;
  phone: string;
  code: string;
  email: string;
  contact_name: string;
  address: string;
  package_id: number;
  profile_picture_url: string;
}

interface AgentRequestModel {
  name: string;
  phone: string;
  email: string;
  province_id: number;
  level_id: number;
  date_of_birth: string;
  gender: number;
  id_number: string;
  pass_word: string;
}

interface AgentStatusRequestModel {
  status: number;
}

@Route('enterprises')
@Tags('enterprises')
export class EnterpriseController extends ApplicationController {
  constructor() {
    super('Enterprise');
  }

  /**
   * @summary Danh sách enterprise
   * @param search
   * @param status
   * @returns enterprise
   */
  @Security('jwt', ['admin'])
  @Get('/')
  public async listEnterprise(
    @Request() request: any,
    @Query() search?: string,
    @Query() status?: number,
    @Query() from_date?: string,
    @Query() to_date?: string,
  ): Promise<SuccessResponseModel<any>> {
    const paging = handlePagingMiddleware(request);
    const schema = Joi.object({
      search: Joi.string().allow(null, ''),
      status: Joi.number()
        .integer()
        .empty([null, ''])
        .valid(...Object.values(ENTERPRISE_STATUS))
        .label('Trạng thái hoạt động'),
      from_date: Joi.date().allow(null, ''),
      to_date: Joi.date().allow(null, ''),
    });

    const {
      search: searchString,
      status: statusValue,
      from_date: fromDate,
      to_date: toDate,
    } = await schema.validateAsync({ search, status, from_date, to_date });

    const whereOptions: any = { is_active: IS_ACTIVE.ACTIVE };
    if (search) {
      whereOptions.name = { [Op.like]: `%${searchString}%` };
    }
    if (status != undefined) {
      whereOptions.status = statusValue;
    }

    const { rows, count } = await Enterprise.findAndCountAll({
      where: whereOptions,
      limit: paging.limit,
      offset: paging.offset,
    });
    return withPagingSuccess(rows, { page: paging.page, totalItemCount: count, limit: paging.limit });
  }

  @Post('/')
  @Security('jwt', ['admin'])
  public async createEnterprise(
    @Request() request: any,
    @Body()
    body: EnterpriseRequestModel & { password: string },
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user.data;
    const schema = Joi.object({
      name: Joi.string().required().label('Tên'),
      phone: Joi.string().required().label('Số điện thoại'),
      code: Joi.string().required().label('Mã công ty'),
      email: Joi.string().allow('', null),
      contact_name: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      package_id: Joi.number(),
      profile_picture_url: Joi.string().allow('', null),
      status: Joi.string().default(ENTERPRISE_STATUS.ACTIVE),
      password: Joi.string().required(),
    });
    const { name, phone, code, email, contact_name, address, package_id, profile_picture_url, status, password } =
      await schema.validateAsync(body);
    const foundEnterprise = await enterpriseService.validateEnterpriseCode(code);
    if (foundEnterprise) {
      throw new AppError(apiCode.INVALID_PARAM).with('Mã công ty đã được sử dụng');
    }

    const createdUser = await sequelize.transaction(async (transaction) => {
      const wallet = await Wallet.create({ ballance: 0 }, { transaction });
      const enterprise = await Enterprise.create(
        {
          user_name: phone,
          name,
          phone,
          code,
          email,
          contact_name,
          address,
          package_id,
          profile_picture_url,
          wallet_id: wallet.id,
          create_by: loginUser.id,
        },
        { transaction },
      );
      const user = await User.create(
        {
          email,
          name,
          df_type_user_id: ROLE.ENTERPRISE,
          password,
          phone,
          address,
          user_name: phone,
          create_by: loginUser.id,
          enterprise_id: enterprise.id,
        },
        { transaction },
      );
      return user;
    });
    const data = await User.findOne({ where: { id: createdUser.id }, include: [{ model: Enterprise }] });
    return withSuccess(data);
  }

  /**
   *
   */
  @Security('jwt')
  @Put('/{id}')
  public async updateEnterprise(
    @Request() request: any,
    id: number,
    @Body() body: EnterpriseRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    // FIXME: Có được sửa mã công ty không???
    const loginUser = request.user?.data as AuthorizedUser;
    const foundEnterprise = await Enterprise.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    if (!foundEnterprise) {
      throw new AppError(apiCode.NOT_FOUND).with('Không tìm thấy nhà cung cấp');
    }
    const schema = Joi.object({
      name: Joi.string().required().label('Tên'),
      phone: Joi.string().required().label('Số điện thoại'),
      code: Joi.string().required().label('Mã công ty'),
      email: Joi.string().allow('', null),
      contact_name: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      package_id: Joi.number(),
      profile_picture_url: Joi.string().allow('', null),
    });
    const { name, phone, code, email, contact_name, address, package_id, profile_picture_url, password } =
      await schema.validateAsync(body);
    const createdUser = await sequelize.transaction(async (transaction) => {
      const enterprise = await foundEnterprise.update(
        {
          name,
          phone,
          email,
          contact_name,
          address,
          package_id,
          profile_picture_url,
          update_by: loginUser.id,
          update_at: new Date(),
        },
        { transaction },
      );
      const user = await User.update(
        {
          email,
          name: contact_name,
          phone,
          address,
          user_name: phone,
          update_by: loginUser.id,
          update_at: new Date(),
        },
        { transaction, where: { enterprise_id: id, df_type_user_id: ROLE.ENTERPRISE, is_active: IS_ACTIVE.ACTIVE } },
      );
      return user;
    });
    const data = await Enterprise.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    return withSuccess(data);
  }

  @Security('jwt')
  @Put('/{id}/status')
  public async changeStatusEnterprise(
    @Request() request,
    id: number,
    @Body() body: { status: number },
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const foundEnterprise = await Enterprise.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    if (!foundEnterprise) {
      throw new AppError(apiCode.NOT_FOUND).with('Không tìm thấy nhà cung cấp');
    }
    const schema = Joi.object({
      status: Joi.number().valid(...Object.values(ENTERPRISE_STATUS)),
    });
    const bodyData = await schema.validateAsync(body);
    foundEnterprise.update({ status: bodyData.status });
    return withSuccess({});
  }

  @Post('/{id}/add-money')
  public async addMoneyEnterprise(@Body() body: { money: number; reason: string }): Promise<SuccessResponseModel<any>> {
    return withSuccess(enterprises[0]);
  }

  @Get('/{id}')
  @Security('jwt')
  public async getEnterprise(id: number): Promise<SuccessResponseModel<any>> {
    const foundEnterprise = await Enterprise.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    if (!foundEnterprise) {
      throw apiCode.NOT_FOUND;
    }
    return withSuccess(foundEnterprise);
  }

  @Delete('/{id}')
  @Security('jwt')
  public async deleteEnterprise(@Request() request, id: number): Promise<SuccessResponseModel<any>> {
    // FIXME: Do delete user enterprise, delete all enterprise's user
    const loggedInUser = request.user?.data as AuthorizedUser;

    const item = await Enterprise.update(
      { is_active: IS_ACTIVE.INACTIVE },
      { where: { id: id, is_active: IS_ACTIVE.ACTIVE } },
    );
    if (!item) {
      throw new AppError(apiCode.NOT_FOUND);
    }
    return withSuccess({});
  }

  // Tạo tài khoản admin bên web ENTERPRISE
  @Get('/{id}/users')
  public async listUserEnterprise(
    @Query() search?: string,
    @Query() status?: number,
    @Query() province_id?: number,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(users[0]);
  }
  @Post('/{id}/users')
  public async createUserEnterprise(
    @Body()
    body: UserRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(usersDetail[0]);
  }
  @Put('/{id}/user/{id}/change-password')
  public async changePasswordUser(
    @Body() body: { old_password: string; new_password: string },
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }
  @Put('/{id}/users/{id}/reset-password')
  public async resetPasswordUser(@Body() body: { id: number[] }): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }
  @Get('/{id}/users/{id}')
  public async detailUser(): Promise<SuccessResponseModel<any>> {
    return withSuccess(usersDetail[0]);
  }

  @Put('/{id}/users/{id}')
  public async updateInfoUser(
    @Body()
    body: UserRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(usersDetail[0]);
  }

  @Delete('/{id}/user/{id}')
  public async deleteUser(): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  // PHẦN TÀI KHOẢN CỘNG TÁC VIÊN DO ENTERPEISE TẠO
  @Get('/{id}/agent')
  public async listAgent(
    @Query() search?: string,
    @Query() status?: number,
    @Query() province_id?: number,
    @Query() type?: number,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(agentInfo[0]);
  }

  @Post('/{id}/agent')
  public async createAgent(
    @Body()
    body: AgentRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(agent[0]);
  }
  @Put('/{id}/agent')
  public async updateAgent(
    @Body()
    body: AgentRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(agent[0]);
  }

  @Delete('/{id}/agent/{id}')
  public async deleteAgent(): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  @Put('/{id}/agent/{id}/change-status')
  public async changeStatusAgent(@Body() body: AgentStatusRequestModel): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  @Get('/check-code')
  public async getEnterpriseByCode(@Query() code): Promise<SuccessResponseModel<any>> {
    if (!code) {
      return withSuccess(null);
    }
    const foundEnterprise = await enterpriseService.validateEnterpriseCode(code);
    return withSuccess(foundEnterprise);
  }
}
