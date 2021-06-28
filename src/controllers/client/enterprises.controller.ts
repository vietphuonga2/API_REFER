import {
  Body,
  Security,
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
  Header,
  Request,
} from 'tsoa';
import {
  SuccessResponseModel,
  ErrorResponseModel,
  withError,
  withSuccess,
  withPagingSuccess,
} from '../models/BaseResponseModel';
import { handlePagingMiddleware, pagingMiddleware } from '@middleware/pagingMiddleware';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG, PRODUCT_MEDIA_TYPE } from '@commons/constant';
import { ApplicationController } from '..';
import { category, atrribute, atrributeDetail } from '../mock/category';
import Joi from '../../helpers/validationHelper';
import { required } from 'joi';
import { enterprises } from '@controllers/mock/enterprises';
import { AuthorizedUser } from '@commons/types';

const db = require('@models');
const {
  Role,
  DFProvince,
  sequelize,
  Sequelize,
  User,
  Category,
  Wishlist,
  Product,
  ProductPrice,
  Agent,
  AgentEnterprise,
  AgentProduct,
  AgentProductMedia,
  ProductMedia,
  Level,
  Enterprise,
} = db.default;
const { Op } = Sequelize;

// interface CategoryRequestModel {
//   name: string;
//   type: number;
//   display_order: number;
//   attribute_option: any;
//   // value: string;
//   // product_id: number;
//   // category_attribute_option_id: number;
// }

/**
 * Danh mục sản phẩm
 */
@Route('client/enterprise')
@Tags('client/enterprise')
export class ClientAgentEnterpriseController extends ApplicationController {
  constructor() {
    super('Enterprise');
  }
  /**
   * @summary Danh sach nhà cung cấp đã đăng kí và nhà cung cấp phù hợp
   */
  @Security('jwt', ['agent'])
  @Get('/agent-enterprise')
  public async listCategory(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('type') type?: number,
    @Query('enterprises_id') enterprises_id?: number,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    const { offset, limit, page } = handlePagingMiddleware(request);
    if (type == 1) {
      const { count, rows } = await AgentEnterprise.findAndCountAll({
        where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agentId.id },
        attributes: [
          [sequelize.col('Enterprise.name'), 'enterprise_name'],
          [sequelize.col('Enterprise.id'), 'enterprise_id'],
          [sequelize.col('Level.value'), 'percent'],
          'enterprise_id',
          'revenue',
          'comission',
          'count_order',
          'count_product',
          'level_id',
        ],
        include: [
          {
            model: Enterprise,
            attributes: ['id'],
            where: { is_active: IS_ACTIVE.ACTIVE },
          },
          {
            model: Agent,
            attributes: ['id', 'user_id'],
            where: { is_active: IS_ACTIVE.ACTIVE },
            include: [
              {
                model: AgentProduct,
                attributes: ['id', 'name', 'description'],
                where: { is_active: IS_ACTIVE.ACTIVE },
                include: [
                  {
                    model: Product,
                    attributes: ['id', 'name'],
                    where: { is_active: IS_ACTIVE.ACTIVE },
                    include: [
                      {
                        model: ProductPrice,
                        attributes: ['price'],
                        where: { is_active: IS_ACTIVE.ACTIVE, agent_id: null },
                      },
                      {
                        model: ProductMedia,
                        attributes: ['media_url'],
                        required: false,
                        where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Level,
            attributes: ['id', 'value'],
            required: false,
            where: { is_active: IS_ACTIVE.ACTIVE },
          },
        ],
        page,
        offset,
      });
      return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
    }
    if (type == 2) {
      // return withSuccess(1);
      const { count, rows } = await Enterprise.findAndCountAll({
        attributes: [
          'id',
          'name',
          [
            sequelize.literal(`(
                SELECT COUNT(DISTINCT product.id)
                FROM product AS product
                LEFT JOIN enterprise AS en
                ON product.enterprise_id = en.id
                WHERE
                product.is_active = ${IS_ACTIVE.ACTIVE}
                and product.enterprise_id = product.id
                )`),
            'countProduct',
          ],
        ],
        where: { is_active: IS_ACTIVE.ACTIVE },
        include: {
          model: Product,
          attributes: ['id', 'name', 'description'],
          where: { is_active: IS_ACTIVE.ACTIVE },
          include: [
            {
              model: ProductPrice,
              attributes: ['price'],
              where: { is_active: IS_ACTIVE.ACTIVE, agent_id: null },
            },
            {
              model: ProductMedia,
              attributes: ['media_url'],
              required: false,
              where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
            },
            {
              model: Category,
              required: false,
              where: { is_active: IS_ACTIVE.ACTIVE },
              include: {
                model: Wishlist,
                where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agentId.id },
              },
            },
          ],
        },
      });
      return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
    }
    // const { count, rows } = await AgentEnterprise.findAndCountAll({
    //   where: { agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE },
    //   include: [
    //     {
    //       model: Agent,
    //       attributes: ["id", "user_id"],
    //       where: { is_active: IS_ACTIVE.ACTIVE },
    //       include: [
    //         {
    //           model: AgentProduct,
    //           attributes: ["id", "name", "description"],
    //           where: { is_active: IS_ACTIVE.ACTIVE },
    //           include: [
    //             {
    //               model: Product,
    //               attributes: ["id", "name"],
    //               where: { is_active: IS_ACTIVE.ACTIVE },
    //               include: [
    //                 {
    //                   model: ProductPrice,
    //                   attributes: ["price"],
    //                   where: { is_active: IS_ACTIVE.ACTIVE, agent_id: null },
    //                 },
    //                 {
    //                   model: ProductMedia,
    //                   attributes: ["media_url"],
    //                   required: false,
    //                   where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
    //                 },
    //               ]
    //             },
    //             // {
    //             //   model: AgentProductMedia,
    //             //   attributes: ["media_url"],
    //             //   where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
    //             // },
    //             // {
    //             //   model: ProductPrice,
    //             //   attributes: ["price"],
    //             //   where: { is_active: IS_ACTIVE.ACTIVE },
    //             // }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       model: Level,
    //       attributes: ["id", "value"],
    //       required: false,
    //       where: { is_active: IS_ACTIVE.ACTIVE },
    //     },
    //   ],
    //   page,
    //   offset,
    // });
  }
}
