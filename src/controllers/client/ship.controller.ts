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

import { ship, payment } from '../mock/ship';

const db = require('@models');

const { sequelize, Sequelize, Ship, DFTypePayment } = db.default;
const { Op } = Sequelize;
@Route('agent-ship')
@Tags('agent/ship')
export class ShipController extends ApplicationController {
    constructor() {
        super('Ship');
    }

    /**
     * @summary Chi tiết đơn vị
     */
    // @Security('jwt', ['agent'])
    @Get('/')
    public async listShip(
        @Request() request: any,
        @Query() customId: number,
        @Query() shopId: number,
    ): Promise<PagingResponseModel<any>> {

        return withSuccess(ship)
    }
    /**
     * @summary hình thức thanh toán
     */
    // @Security('jwt', ['agent'])
    @Get('/payment')
    public async listPayment(
        @Request() request: any,
    ): Promise<PagingResponseModel<any>> {
        // const dt_all = await DFTypePayment.findOne({
        //     where: { is_active: IS_ACTIVE.ACTIVE, },
        // });
        // return withSuccess(dt_all)
        return withSuccess(payment)
    }

}