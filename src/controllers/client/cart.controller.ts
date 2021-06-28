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

import { cart, cart_detail } from '../mock/cart';

const db = require('@models');

const { sequelize, Sequelize, Cart, Agent, AgentCart, ProductPrice, Product, ProductCustomAttributeOption, User, Enterprise, Stock, AgentEnterprise } = db.default;
const { Op } = Sequelize;
@Route('agent-cart')
@Tags('agent/cart')
export class CartController extends ApplicationController {
    constructor() {
        super('Cart');
    }
    /**
     * @summary Thêm mới giỏ hàng
     */
    @Security('jwt', ['agent'])
    @Post('/')
    public async createCart(
        @Request() request: any,
        @Body() body: {
            product_price_id: number;
            quantity: number;
        },
    ): Promise<SuccessResponseModel<any>> {
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const _agent = await Agent.findOne({
            where: { user_id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE },
        });
        if (!_agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const schema = Joi.object({
            product_price_id: Joi.number().empty(['', null, 'null']).required(),
            quantity: Joi.number().empty(['', null, 0, '0']).required(),
        });
        const bodyData = await schema.validateAsync(body);
        if (body.quantity <= 0 || body.quantity == undefined) throw new AppError(apiCode.DB_ERROR);
        const createdCart = await AgentCart.create({
            product_price_id: bodyData.product_price_id,
            quantity: bodyData.quantity,
            agent_id: _agent.id,
            is_active: IS_ACTIVE.ACTIVE,
        })
        const dataAll = await AgentCart.findOne({
            where: { id: createdCart.id },
            include: [
                {
                    model: ProductPrice,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                    include: [
                        {
                            model: Product,
                            where: { is_active: IS_ACTIVE.ACTIVE },
                        },
                        {
                            attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                            model: ProductCustomAttributeOption,
                            as: "product_attribute_name_1",
                        },
                        {
                            attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                            model: ProductCustomAttributeOption,
                            as: "product_attribute_name_2",
                        },

                    ],
                }
            ]
        })
        return withSuccess(dataAll);
        // return withSuccess(cart);
    }

    /**
     * @summary Chi tiết giỏ hàng
     */
    @Security('jwt', ['agent'])
    @Get('/')
    // public async getCart(id: number): Promise<SuccessResponseModel<any>> {
    public async getCart(@Request() request: any,): Promise<SuccessResponseModel<any>> {
        // let checkIdUser;
        // let checkIdEnterprise;
        const loggedInUser = request?.user?.data as AuthorizedUser;
        const _agent = await Agent.findOne({
            where: { user_id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE },
            // include: [
            //     {
            //         model: AgentEnterprise,
            //         where: { agent_id: Agent.id }
            //     }
            // ]
        });
        const _agentEnterprice = await AgentEnterprise.findOne({
            where: { agent_id: _agent.id, is_active: IS_ACTIVE.ACTIVE },
        })
        if (!_agent) throw new AppError(apiCode.REASON_AGENT_EXITS);

        // const productPrices = await AgentCart.findAll(
        //     {
        //         include: [
        //             {
        //                 model: ProductPrice,
        //                 where: {
        //                     is_active: IS_ACTIVE.ACTIVE,
        //                 },
        //                 include: [
        //                     {
        //                         model: Product,
        //                         where: {
        //                             is_active: IS_ACTIVE.ACTIVE,
        //                         },
        //                         include: [
        //                             {
        //                                 model: ProductPrice,
        //                                 where: { [Op.or]: [{ level_id: _agentEnterprice.level_id }, { [Op.is]: null }] }
        //                             }
        //                         ]
        //                     }
        //                 ]
        //             }
        //         ]
        //     })
        // // console.log(productPrices)
        // return withSuccess(productPrices);

        const dtAll = await Enterprise.findAll({
            where: { is_active: IS_ACTIVE.ACTIVE },
            include: [
                {
                    model: Stock,
                    // required: false,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                    include: [
                        {
                            model: ProductPrice,
                            attributes: [
                                'id',
                                'tier_index',
                                'product_id',
                                'stock_id',
                                'level_id',
                                'custom_attribute_option_id_1',
                                'custom_attribute_option_id_2',
                                'status',
                                'is_active',
                                'price'
                                // [
                                //     sequelize.literal(`(
                                //     SELECT price
                                //     FROM product_price 
                                //     WHERE
                                //     product_price.id = ProductPrice.id
                                //     and
                                //     product_price.is_active = ${IS_ACTIVE.ACTIVE}
                                //     and agent_id = ${_agent.id}
                                //     and tier_index = ${tier_index}
                                //     and level_id IS NULL
                                //     )`),
                                //     'price',
                                // ],
                            ],
                            // required: false,
                            where: {
                                is_active: IS_ACTIVE.ACTIVE,
                            },
                            include: [
                                {
                                    model: AgentCart,
                                    // required: false,
                                    where: { is_active: IS_ACTIVE.ACTIVE, agent_id: _agent.id },
                                },
                                {
                                    model: Product,
                                    where: { is_active: IS_ACTIVE.ACTIVE },
                                },
                                {
                                    attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                                    model: ProductCustomAttributeOption,
                                    as: "product_attribute_name_1",
                                },
                                {
                                    attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                                    model: ProductCustomAttributeOption,
                                    as: "product_attribute_name_2",
                                },

                            ],
                        }
                    ]
                }
            ],

            logging: console.log
        })
        const finalItems = dtAll.map(t => {
            if (!t.Stocks) {
                return t
            }
            t.Stocks = t.Stocks.map(s => {
                const ids = []
                const prices = {}
                s.ProductPrices.forEach(pp => {
                    const k = `${pp.product_id}_${pp.stock_id}_${pp.custom_attribute_option_id_1}_${pp.custom_attribute_option_id_2}`
                    let item = prices[k]
                    if (!item) {
                        if (pp.level_id) {
                            pp.setDataValue("discount_price", pp.price)
                            pp.setDataValue("price", pp.price)
                        }
                        prices[k] = pp
                        ids.push(k)
                    } else {
                        if (pp.level_id) {
                            item.setDataValue("discount_price", pp.price)
                        } else {
                            item.setDataValue("price", pp.price)
                        }
                    }
                })
                s.ProductPrices = ids.map(k => prices[k])
                s.ProductPrices.forEach(pp => {
                    pp.setDataValue('AgentCart', pp.AgentCarts[0])
                    pp.setDataValue('AgentCarts', null)
                })
                return s
            })
            return t
        });
        return withSuccess(finalItems);
        // return withSuccess(dtAll);
    }
    /**
    * @summary Sửa giỏ hàng
    */
    @Security('jwt', ['agent'])
    @Put('/{id}')
    public async updateCart(
        id: number,
        @Request() request: any,
        @Body()
        body: {
            quantity: number;
        },): Promise<SuccessResponseModel<any>> {

        const loggedInUser = request?.user?.data as AuthorizedUser;
        const _agent = await Agent.findOne({
            where: { user_id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE },
        });
        if (!_agent) throw new AppError(apiCode.REASON_AGENT_EXITS);
        const checkIdCart = await AgentCart.findOne({
            where: { id, is_active: IS_ACTIVE.ACTIVE },
        });
        const schema = Joi.object({
            quantity: Joi.number().empty(['', null, 0, '0']),
        });
        const bodyData = await schema.validateAsync(body);
        const cartId = await sequelize.transaction(async (transaction) => {
            if (bodyData.quantity == 0 || bodyData.quantity == undefined) {
                await AgentCart.update(
                    {
                        quantity: bodyData.quantity,
                        is_active: IS_ACTIVE.INACTIVE,
                        update_at: Date.now(),
                    },
                    {
                        where: { id },
                        transaction,
                    }
                )
            } else {
                await AgentCart.update(
                    {
                        quantity: bodyData.quantity,
                    },
                    {
                        where: { id },
                        transaction,
                    },
                )
            }
            // return checkIdCart.id;
        })
        const _dataUpdateCart = await AgentCart.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
        // if (bodyData.quantity == 0) {
        //     const deleteCart = await AgentCart.update({
        //         quantity: bodyData.quantity,
        //         is_active: IS_ACTIVE.INACTIVE,
        //     })
        // } else {
        //     const createdCart = await AgentCart.update({
        //         quantity: bodyData.quantity,
        //     })
        // }
        // return this.getCart({ cart }[0]);
        // return this.agentCartDetail(cartId);
        return withSuccess(_dataUpdateCart);
    }
    /**
     * @summary Xóa giỏ hàng
     */
    // @Security('jwt', ['agent'])
    @Delete('/{id}')
    public async deleteCart(id: number, @Request() request: any): Promise<SuccessResponseModel<any>> {
        const deleteCart = await AgentCart.update(
            {
                is_active: IS_ACTIVE.INACTIVE,
                update_at: Date.now(),
                delete_at: Date.now(),
            },
            {
                where: { id },
            }
        )
        return withSuccess({});
    }
    /**
     * @summary Chi tiết đơn hàng trong giỏ hàng
     */
    public async agentCartDetail(id: number) {
        const dt = await AgentCart.findOne({
            where: { id, is_active: IS_ACTIVE.ACTIVE },
            include: [
                {
                    model: ProductPrice,
                    where: {
                        is_active: IS_ACTIVE.ACTIVE,
                    },
                    include: [
                        {
                            model: Product,
                            where: { is_active: IS_ACTIVE.ACTIVE },
                        },
                        {
                            attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                            model: ProductCustomAttributeOption,
                            as: "product_attribute_name_1",
                        },
                        {
                            attributes: ["id", "product_custom_attribute_id", "name", "is_active"],
                            model: ProductCustomAttributeOption,
                            as: "product_attribute_name_2",
                        },

                    ],
                }
            ]
        })
        return withSuccess(dt);
    }
}