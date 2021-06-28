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

import { customer, customer_detail, } from '../mock/customer';

const db = require('@models');

const { sequelize, Sequelize, Customer, DFProvince, DFDistrict, DFWard, Agent } = db.default;
const { Op } = Sequelize;
@Route('agent-customer')
@Tags('agent/customer')
export class CustomerController extends ApplicationController {
    constructor() {
        super('Customer');
    }
    /**
     * @summary Thêm mới người nhận
     */
    @Security('jwt', ['agent'])
    @Post('/')
    public async createCustomer(
        @Request() request: any,
        @Body() body: {
            name: string;
            phone: string;
            df_province_id: any;
            df_district_id: any;
            df_ward_id: any;
            address: string;
            location_address: string;
            lat?: number;
            long?: number;
        },
    ): Promise<SuccessResponseModel<any>> {
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
        if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const schema = Joi.object({
            name: Joi.string().empty(['null', null, '']).required(),
            phone: Joi.string().empty(['null', null, '']).required(),
            df_province_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            df_district_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            df_ward_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            address: Joi.string().empty(['null', null, '']),
            location_address: Joi.string().empty(['null', null, '']),
            lat: Joi.number().empty(['', null, 0, '0', ""]),
            long: Joi.number().empty(['', null, 0, '0', ""]),
        });
        const bodyData = await schema.validateAsync(body);
        const createdCustomer = await Customer.create({
            name: bodyData.name,
            phone: bodyData.phone,
            agent_id: agent.id,
            df_province_id: (bodyData.df_province_id == undefined) ? null : bodyData.df_province_id,
            df_district_id: (bodyData.df_district_id == undefined) ? null : bodyData.df_district_id,
            df_ward_id: (bodyData.df_ward_id == undefined) ? null : bodyData.df_ward_id,
            address: bodyData.address,
            location_address: bodyData.location_address,
            lat: (bodyData.lat == undefined) ? null : bodyData.lat,
            long: (bodyData.long == undefined) ? null : bodyData.long,
            is_active: IS_ACTIVE.ACTIVE,
        }, { logging: true });

        const dataAll = await Customer.findOne({
            where: { id: createdCustomer.id },
            include: [
                {
                    model: DFProvince,
                    required: false,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                },
                {
                    attributes: ["id", "name", "value", "province_id", "is_active"],
                    model: DFDistrict,
                    required: false,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                },
                {
                    attributes: ["id", "name", "value", "district_id", "is_active"],
                    model: DFWard,
                    required: false,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                },
            ]
        })
        return withSuccess(dataAll);
        // return withSuccess(customer);
    }
    /**
     * @summary Chi tiết người nhận
     */
    @Security('jwt', ['agent'])
    @Get('/{id}')
    public async getCustomer(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
        if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const checkId = await Customer.findOne({
            where: { is_active: IS_ACTIVE.ACTIVE, id },
        }); //check ID có isactive == 1
        if (checkId == null) throw new AppError(apiCode.DATA_EXIST);

        const dt_all = await Customer.findOne({
            where: { id: id, is_active: IS_ACTIVE.ACTIVE, agent_id: agent.id, },
        });
        return withSuccess({ dt_all });
        // return withSuccess(customer);
    }
    /**
    * @summary Sửa người nhận
    */
    @Security('jwt', ['agent'])
    @Put('/{id}')
    public async updateCustomer(
        id: number,
        @Request() request: any,
        @Body()
        body: {
            name: string;
            phone: string;
            df_province_id: any;
            df_district_id: any;
            df_ward_id: any;
            address: string;
            location_address: string;
        },): Promise<SuccessResponseModel<any>> {
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
        if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const schema = Joi.object({
            name: Joi.string().empty(['null', null, '']).required(),
            phone: Joi.string().empty(['null', null, '']).required(),
            df_province_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            df_district_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            df_ward_id: Joi.number().empty(['', null, 'null', 0, '0', ""]),
            address: Joi.string().empty(['null', null, '']),
            location_address: Joi.string().empty(['null', null, '']),
            lat: Joi.number().empty(['', null, 0, '0', ""]),
            long: Joi.number().empty(['', null, 0, '0', ""]),
        });
        const bodyData = await schema.validateAsync(body);
        const _updateCustomer = await Customer.update(
            {
                name: bodyData.name,
                phone: bodyData.phone,
                agent_id: agent.id,
                df_province_id: (bodyData.df_province_id == undefined) ? null : bodyData.df_province_id,
                df_district_id: (bodyData.df_district_id == undefined) ? null : bodyData.df_district_id,
                df_ward_id: (bodyData.df_ward_id == undefined) ? null : bodyData.df_ward_id,
                address: bodyData.address,
                location_address: bodyData.location_address,
                lat: (bodyData.lat == undefined) ? null : bodyData.lat,
                long: (bodyData.long == undefined) ? null : bodyData.long,
                update_at: Date.now(),
            },
            {
                where: { id },
            }
        )
        const _dataUpdateCustomer = await Customer.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
        return withSuccess(_dataUpdateCustomer);
    }
    /**
     * @summary Xóa người nhận
     */
    @Security('jwt', ['agent'])
    @Delete('/{id}')
    public async deleteCustomer(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
        if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const _deleteCustomer = await Customer.update(
            {
                is_active: IS_ACTIVE.INACTIVE,
                update_at: Date.now(),
                delete_at: Date.now(),
            },
            {
                where: { id, agent_id: agent.id },
            }
        )
        return withSuccess({});
    }
    /**
     * @summary tìm kiếm người nhận
     */
    @Security('jwt', ['agent'])
    @Get('/')
    public async listCustomer(
        @Request() request: any,
        @Query() search?: string,
    ): Promise<PagingResponseModel<any>> {
        //validate 
        // console.log(search)
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const agent = await Agent.findOne({ where: { user_id: loggedInUser.id } });
        if (!agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const schema = Joi.object({
            search: Joi.string().trim().empty(['null', null, '', ""]),
        });
        const queryObj = await schema.validateAsync({ search });

        const { offset, limit, page } = handlePagingMiddleware(request);
        const { rows, count } = await Customer.findAndCountAll({

            where: {
                name: { [Op.substring]: queryObj.search ? queryObj.search : "" },
                // name: { [Op.substring]: queryObj.search ? queryObj.search : { [Op.ne]: null } },
                is_active: IS_ACTIVE.ACTIVE,
                agent_id: agent.id,
            },
            logging: true,
            limit,
            offset,
        });

        return withPagingSuccess(rows, { page, limit, totalItemCount: count });
        // return withSuccess(customer_detail)
    }
}