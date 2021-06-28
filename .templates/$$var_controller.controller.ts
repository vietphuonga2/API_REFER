import { IS_ACTIVE, apiCode, USER_STATUS } from '@commons/constant';
import { ApplicationController } from './';

import Joi from '../helpers/validationHelper';
import { Body, Controller, Get, Path, Post, Put, Query, Route, SuccessResponse, Delete, Tags } from 'tsoa';
import { SuccessResponseModel, ErrorResponseModel, withError, withSuccess } from './models/BaseResponseModel';
const db = require('@models');

const { sequelize, Sequelize, User } = db.default;
const { Op } = Sequelize;

@Route('$$var_controller')
@Tags('$$var_class')
export class $$var_classController extends ApplicationController {
  constructor() {
    super('$$var_class');
  }

  @Get('/')
  public async getList$$var_class(): Promise<SuccessResponseModel<any>> {
    return withSuccess({ name: 'example' });
  }

  @Post('/')
  public async create$$var_class(@Body() body: { name: string }): Promise<SuccessResponseModel<any>> {
    return withSuccess({ name: 'example' });
  }

  @Get('/{id}')
  public async get$$var_class(): Promise<SuccessResponseModel<any>> {
    return withSuccess({ name: 'example' });
  }
}
