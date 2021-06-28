import {
  IS_ACTIVE,
  apiCode,
  AppError,
  USER_STATUS,
  ROLE,
  PRODUCT_MEDIA_TYPE,
  GENDER,
  CONFIG,
  USER_TYPE,
} from '@commons/constant';
import { ApplicationController } from './';
import { handlePagingMiddleware } from '@middleware/pagingMiddleware';
import Joi from '../helpers/validationHelper';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import * as bcrypt from 'bcryptjs';
import {
  Body,
  Request,
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
  Security,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from './models/BaseResponseModel';
import { users, myInfo } from './mock/users';
import {
  UserWithPasswordModel,
  UserRequestModel,
  UserRequestSchema,
  BasicUserSchema,
  PasswordSchema,
  NotUserTypeSchema,
  AgentReferalSchema,
} from './models/UserRequestModel';
import * as enterpriseService from '../services/enterprises.service';
import { AuthorizedUser } from '@commons/types';
import { getBaseServer, getFullUrl } from '@helpers/requestHelper';
import * as express from 'express';

// import { AuthorizedUser, MulterRequest } from '@commons/types';

const db = require('@models');
const { DFProvince, sequelize, Sequelize, User, Enterprise, Agent, Wallet } = db.default;
const { Op } = Sequelize;

interface UserLoginParams {
  user_name: string;
  password: string;
}

@Route('users')
@Tags('user')
export class UsersController extends ApplicationController {
  constructor() {
    super('User');
  }

  @Put('/login')
  public async login(@Body() requestBody: UserLoginParams): Promise<SuccessResponseModel<any>> {
    const foundUser = await User.findOne({ where: { user_name: requestBody.user_name } });
    if (!foundUser || !foundUser.authenticate(requestBody.password)) {
      throw new AppError(apiCode.LOGIN_FAIL);
    }
    const data = await super._update(
      { token: foundUser.generateToken(), last_login_date: new Date() },
      { where: { id: foundUser.id } },
    );
    const updatedUser = await this._findOne({ where: { id: foundUser.id } });
    return withSuccess(updatedUser);
  }

  @Security('jwt')
  @Put('/logout')
  public async logout(@Request() request: any): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request.user?.data;
    if (!loggedInUser) {
      throw new AppError(apiCode.INVALID_ACCESS_TOKEN);
    }
    await User.update({ token: null }, { where: { id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE } });
    return withSuccess({});
  }

  @Security('jwt')
  @Put('/change-password')
  public async changePassword(
    @Request() request: any,
    @Body() body: { old_password: string; new_password: string },
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user.data as AuthorizedUser;
    const foundUser = await User.findOne({ where: { id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE } });
    if (!foundUser || !foundUser.authenticate(body.old_password)) {
      throw new AppError(apiCode.PASSWORD_FAIL);
    }
    await foundUser.update({ password: User.generatePassword(body.new_password), token: null, update_at: new Date() });

    return withSuccess(foundUser);
  }

  @Put('/forgot-password')
  public async forgotPassword(@Body() body: { email: string }): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  /**
   * @summary Đăng ký tài khoản agent sử dụng form-data
   * @param request
   * @returns
   */
  @Post('/register')
  public async registerFormData(@Request() request: express.Request): Promise<SuccessResponseModel<any>> {
    await uploadMiddleware.handleSingleFile(request, 'profile_picture', PRODUCT_MEDIA_TYPE.IMAGE);

    const { filename, fieldname, destination, path } = request.file || {};
    const baseUrl = getBaseServer(request);

    const bodyData = await BasicUserSchema.concat(PasswordSchema)
      .concat(AgentReferalSchema)
      .validateAsync({
        ...request.body,
        df_type_user_id: ROLE.AGENT,
      });

    if (bodyData.enterprise_code) {
      const foundEnterprise = await enterpriseService.validateEnterpriseCode(bodyData.enterprise_code);
      if (!foundEnterprise) {
        throw new AppError(apiCode.INVALID_PARAM).with('Mã công ty không tồn tại');
      }
    }
    let referalAgentId = null;
    if (bodyData.referal_id) {
      const foundReferalAgent = await User.findOne({
        where: { user_name: bodyData.referal_id, df_type_user_id: ROLE.AGENT, is_active: IS_ACTIVE.ACTIVE },
      });
      if (!foundReferalAgent) {
        throw new AppError(apiCode.DATA_NOT_EXIST).with('Mã giới thiệu không hợp lệ');
      }
      referalAgentId = foundReferalAgent.id;
    }

    const user = await super._findOne({
      where: { user_name: bodyData.phone, is_active: IS_ACTIVE.ACTIVE },
    });

    if (user) throw new AppError(apiCode.ACCOUNT_EXIST);

    const createdUser = await sequelize.transaction(async (transaction) => {
      const user = await User.create(
        {
          user_name: bodyData.phone,
          df_type_user_id: ROLE.AGENT,
          phone: bodyData.phone,
          password: bodyData.password,
          name: bodyData.name,
          email: bodyData.email,
          profile_picture_url: path,
        },
        { transaction },
      );
      const wallet = await Wallet.create({ ballance: 0 }, { transaction });
      const createdAgent = await Agent.create(
        {
          user_id: user.id,
          wallet_id: wallet.id,
          referal_agent_id: referalAgentId,
        },
        { transaction },
      );
      return user;
    });

    const data = await super._update(
      { token: createdUser.generateToken(), last_login_date: new Date() },
      { where: { id: createdUser.id } },
    );
    const myUser = await User.findOne({ where: { id: createdUser.id }, include: [{ model: Agent }] });
    return withSuccess(myUser);
  }

  @Security('jwt')
  @Get('/info')
  public async getAuthorizedUserInfo(@Request() request: any): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user.data;

    const foundUser = await User.findOne({ where: { id: loginUser.id }, include: [{ model: DFProvince }] });
    if (!foundUser) {
      throw new AppError(apiCode.DATA_NOT_EXIST);
    }
    return withSuccess(foundUser);
  }

  @Security('jwt')
  @Put('/{id}/reset-password')
  public async resetPassword(): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  @Security('jwt')
  @Put('/{id}')
  public async updateUser(
    @Request() req,
    id: number,
    @Body() body: UserRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = req.user?.data;
    const user = await User.findOne({
      where: { id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!user) throw new AppError(apiCode.ACCOUNT_NOT_EXIST);

    const requestData = await UserRequestSchema.concat(NotUserTypeSchema).validateAsync(body);
    requestData.update_by = loginUser.id;
    requestData.update_at = new Date();

    const _ = await User.update(requestData, { where: { id, is_active: IS_ACTIVE.ACTIVE } });
    const updatedUser = await User.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    return withSuccess(updatedUser);
  }

  @Security('jwt')
  @Get('/{id}')
  public async getUser(@Request() request: any, id: number): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user.data;
    const foundUser = await User.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    if (!foundUser) {
      throw new AppError(apiCode.DATA_NOT_EXIST);
    }
    return withSuccess(foundUser);
  }

  @Security('jwt')
  @Delete('/{id}')
  public async deleteUser(@Request() request: any, id: number): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data;

    const foundUser = await User.findOne({ where: { id, is_active: IS_ACTIVE } });
    if (foundUser) {
      if (Object.values(USER_TYPE).includes(foundUser.df_type_user_id)) {
        throw new AppError(apiCode.INVALID_PARAM);
      }
    }

    await User.update(
      {
        is_active: IS_ACTIVE.INACTIVE,
        delete_by: loggedInUser.id,
        delete_at: new Date(),
      },
      { where: { id, is_active: IS_ACTIVE.ACTIVE } },
    );
    return withSuccess({});
  }

  @Security('jwt')
  @Delete('/')
  public async deleteMultipleUser(@Body() body: { id: number[] }): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  @Security('jwt')
  @Get('/')
  public async listUser(
    @Request() request: any,
    @Query() search?: string,
    @Query() status?: number,
  ): Promise<SuccessResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);

    const whereOption = {
      is_active: IS_ACTIVE.ACTIVE,
      df_type_user_id: { [Op.notIn]: Object.values(USER_TYPE) },
      ...(search && { [Op.or]: { name: { [Op.like]: `%${search}%` }, phone: { [Op.like]: `%${search}%` } } }),
    };
    const { count, rows } = await User.findAndCountAll({ where: whereOption, limit, offset });

    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }

  /**
   *  @description Admin - Tạo tài khoản
   */
  @Security('jwt', ['admin'])
  @Post('/')
  public async createUser(
    @Request() req,
    @Body()
    body: UserWithPasswordModel,
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = req.user?.data;
    const reqData: any = await UserRequestSchema.concat(NotUserTypeSchema)
      .keys({
        password: Joi.string().trim().required(),
      })
      .validateAsync(body, { allowUnknown: false });

    if (Object.values(USER_TYPE).includes(reqData.df_type_user_id)) {
      throw new AppError(apiCode.INVALID_PARAM).with('Loại tài khoản không hợp lệ');
    }

    const user = await User.findOne({
      where: { user_name: reqData.phone, is_active: IS_ACTIVE.ACTIVE },
    });
    if (user) throw new AppError(apiCode.ACCOUNT_EXIST);

    reqData.create_by = loggedInUser?.id;

    const createdUser = await super._create({ ...reqData, user_name: body.phone });

    return withSuccess(createdUser);
  }
}
