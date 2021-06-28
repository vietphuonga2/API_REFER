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
import {
  IS_ACTIVE,
  apiCode,
  USER_STATUS,
  ROLE,
  GENDER,
  CONFIG,
  PRODUCT_MEDIA_TYPE,
  ROLE_NAMES,
  AppError,
  FILTER_TYPE,
  PRODUCT_STATUS,
} from '@commons/constant';
import { ApplicationController } from '..';
import { AuthorizedUser } from '@commons/types';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import * as express from 'express';
import { category, atrribute, atrributeDetail } from '../mock/category';
import Joi from '../../helpers/validationHelper';
import { required } from 'joi';
import { enterprises } from '@controllers/mock/enterprises';
import { getBaseServer } from '@helpers/requestHelper';

const db = require('@models');
const {
  Role,
  DFProvince,
  sequelize,
  Sequelize,
  User,
  Category,
  Enterprise,
  ProductMedia,
  ProductCustomAttribute,
  ProductCustomAttributeOption,
  Wishlist,
  AgentProductMedia,
  ProductPrice,
  Agent,
  Product,
  AgentProduct,
  Stock,
  AgentEnterprise,
  Level,
  ProductAttribute,
  CategoryAttribute,
  AttributeOption,
  ProductStock,
} = db.default;
const { Op } = Sequelize;
const { QueryTypes } = require('sequelize');
interface ProductMulterRequest extends express.Request {
  file: any;
}

interface ProductRequestModel {
  agent_product_media_id: any; // id của ảnh để xoá
  description: string;
}

/**
 * Danh mục sản phẩm
 */

@Route('client/product')
@Tags('client/product')
export class ClientProductController extends ApplicationController {
  constructor() {
    super('Product');
  }

  /**
   * @summary Chi tiết sản phẩm
   */
  @Security('jwt')
  @Get('/{product_id}/agent')
  public async detailProductAgent(
    product_id,
    @Request() request: any,
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);
    let productDetail;
    const loginUser = request.user?.data as AuthorizedUser;
    const agentId = await Agent.findOne({
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });

    // const listAtt = await sequelize.query(
    //   `select concat(attributes.catname, ":" ,group_concat(DISTINCT attributes.attribute_name separator ', ')) as att_name from(select att.name as catname, concat(cat.name) attribute_name, pro_att.category_attribute_id, pro_att.value, pro_att.product_id as product_att_id, cat.* FROM product_attribute as pro_att join category_attribute att on pro_att.category_attribute_id = att.id join attribute_option cat on pro_att.category_attribute_option_id = cat.id where product_id = 137) as attributes group by category_attribute_id`,
    //   {
    //     type: QueryTypes.SELECT
    //   }
    // );
    // await listAtt.forEach(function (att, index) {
    //   console.log(att[0]);
    // });
    // return withSuccess(listAtt);
    // const att = listAtt[0];
    // let att_data = att["att_name"];
    // return withSuccess(JSON.stringify(listAtt));
    productDetail = await Product.findOne({
      attributes: [
        'id',
        'name',
        'description',
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'max_price_enterprise'],
        [sequelize.fn('MIN', sequelize.col('ProductPrices.price')), 'min_price_enterprise'],
        [sequelize.fn('MAX', sequelize.col('ProductPrices.id')), 'max_commision_percent'],
        [sequelize.fn('MIN', sequelize.col('ProductPrices.id')), 'min_commision_percent'],
        // [Sequelize.literal('`products->product_media`.`media_url`'), 'media_url'],
        [
          sequelize.literal(`(
                SELECT product_media.media_url as media_url
                FROM product_media
                WHERE
                product_media.is_active = ${IS_ACTIVE.ACTIVE}
                and product_media.product_id = ${product_id}
                limit 1
                )`),
          'media_url',
        ],
        [
          sequelize.literal(`(
                SELECT MAX(product_price.price)
                FROM product_price AS product_price
                WHERE
                product_price.is_active = ${IS_ACTIVE.ACTIVE}
                and product_price.product_id = ${product_id}
                and ISNULL(product_price.agent_id)
                and ISNULL(level_id)
                )`),
          'max_price_discount',
        ],
        [
          sequelize.literal(`(
                SELECT MIN(product_price.price)
                FROM product_price AS product_price
                WHERE
                product_price.is_active = ${IS_ACTIVE.ACTIVE}
                and product_price.product_id = ${product_id}
                and ISNULL(product_price.agent_id)
                and ISNULL(level_id)
                )`),
          'min_price_discount',
        ],
        [
          sequelize.literal(`(
              select group_concat(attributes.att_name separator '. ') as all_att
        from (
        select concat(att.name, ":" ,group_concat(DISTINCT cat.name separator ', ')) as att_name, att.name as catname, concat(cat.name) attribute_name,pro_att.category_attribute_id, pro_att.value, pro_att.product_id as product_att_id, cat.* FROM product_attribute as pro_att
        join category_attribute att on pro_att.category_attribute_id = att.id
        join attribute_option cat on pro_att.category_attribute_option_id = cat.id
            where product_id = ${product_id}
        group by pro_att.category_attribute_id
            ) as attributes
            group by attributes.product_att_id
                )`),
          'attribute_product',
        ],
        // [sequelize.literal(`${1}`), 'attribute_products'],
      ],
      where: { is_active: IS_ACTIVE.ACTIVE, id: product_id },
      include: [
        {
          model: ProductPrice,
          attributes: ['id', 'product_id', 'stock_id', 'agent_id', 'price'],
          where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agentId.id },
          required: false,
          include: {
            model: Level,
          },
        },
        {
          model: Enterprise,
          attributes: ['id', 'name', 'address'],
          where: { is_active: IS_ACTIVE.ACTIVE },
          required: false,
        },
        {
          model: ProductMedia,
          attributes: ['id', 'media_url', 'type', 'display_order', 'product_custom_attribute_option_id'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
        {
          model: ProductAttribute,
          attributes: ['id', 'product_id', 'category_attribute_option_id', 'category_attribute_id'],
          where: { is_active: IS_ACTIVE.ACTIVE },
          required: false,
          include: [
            {
              model: CategoryAttribute,
              attributes: [
                'id',
                'name',
                [
                  sequelize.literal(`(
                  select group_concat(attributes.att_name separator '. ') as all_att
                  from (
                  select concat(group_concat(DISTINCT cat.name separator ', ')) as att_name, att.name as catname, concat(cat.name) attribute_name,pro_att.category_attribute_id, pro_att.value, pro_att.product_id as product_att_id, cat.* FROM product_attribute as pro_att
                  join category_attribute att on pro_att.category_attribute_id = att.id
                  join attribute_option cat on pro_att.category_attribute_option_id = cat.id
                      where product_id = ${product_id}
                    and ProductAttributes.category_attribute_id = att.id
                  group by pro_att.category_attribute_id
                      ) as attributes
                      group by attributes.product_att_id
                  )`),
                  'attribute_product',
                ],
              ],

              // include: {
              //   model: AttributeOption,
              //   attributes: ['id', 'name'],
              // }
            },
          ],
        },
      ],
      group: [['ProductAttributes.category_attribute_id'], ['ProductMedia.id']],
      // having: sequelize.where(sequelize.col('ProductPrices.agent_id'), '=', null),
      logging: console.log,
    });
    // const agent = await Agent.findOne({
    //   attributes: ['id'],
    //   where: { is_active: IS_ACTIVE.ACTIVE, id: agent_id },
    //   include: [
    //     {
    //       model: ProductPrice,
    //       attributes: ['id', 'product_id', 'stock_id', 'agent_id'],
    //       required: false,
    //       // where: { is_active: IS_ACTIVE.ACTIVE, product_id: product_id, agent_id: agent_id },
    //       where: { is_active: IS_ACTIVE.ACTIVE, product_id: product_id },
    //       include: [
    //         {
    //           model: Product,
    //           attributes: ['code', 'is_public', 'order_type', 'category_id', 'is_ship_type'],
    //           include: {
    //             model: ProductCustomAttribute,
    //             attributes: ['name', 'display_order'],
    //             include: {
    //               model: ProductCustomAttributeOption,
    //               where: { is_active: IS_ACTIVE.ACTIVE },
    //               attributes: ['name', 'id', 'product_custom_attribute_id'],
    //               required: false,
    //             },
    //           },
    //         },
    //         {
    //           model: Stock,
    //           attributes: ['name', 'address'],
    //         },
    //         {
    //           model: ProductCustomAttributeOption,
    //           as: 'product_attribute_name_1',
    //           where: { is_active: IS_ACTIVE.ACTIVE },
    //           attributes: ['name', 'id', 'product_custom_attribute_id'],
    //           required: false,
    //         },
    //         {
    //           model: ProductCustomAttributeOption,
    //           as: 'product_attribute_name_2',
    //           where: { is_active: IS_ACTIVE.ACTIVE },
    //           attributes: ['name', 'id', 'product_custom_attribute_id'],
    //           required: false,
    //         },
    //       ],
    //     },

    //     {
    //       model: AgentProduct,
    //       attributes: ['product_id', 'name', 'description'],
    //       where: { is_active: IS_ACTIVE.ACTIVE },
    //       include: {
    //         model: AgentProductMedia,
    //         attributes: ['media_url', 'type', 'display_order'],
    //       },
    //     },
    //   ],
    //   page,
    //   offset,
    // });
    return withSuccess(productDetail);
  }
  /**
   * @summary Danh sach san pham phu hop
   */
  @Security('jwt', ['agent'])
  @Get('/wishlist-product')
  public async wishListProductAgent(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('search') search?: string,
    @Query('category_id') category_id?: number,
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    // return withSuccess(search);
    const { offset, limit, page } = handlePagingMiddleware(request);
    let whereOption;
    whereOption = {
      name: search ? { [Op.substring]: search } : { [Op.ne]: null },
      is_active: IS_ACTIVE.ACTIVE,
    };
    const agentId = await Agent.findOne({
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(agentId);
    let wishlistCategory = [];
    wishlistCategory = await Wishlist.findAll({
      where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agentId.id },
    });
    const arrayCategory = wishlistCategory.map((element) => ({
      category_id: element.category_id,
    }));
    const idCategory = arrayCategory.map(function (item) {
      return item['category_id'];
    });
    // // if (category_id){
    // //   whereOption.category_id = category_id;
    // // }
    const { count, rows } = await Product.findAndCountAll({
      where: { is_active: IS_ACTIVE.ACTIVE, category_id: category_id ? category_id : { [Op.in]: idCategory } },
      include: [
        {
          model: Enterprise,
          // required: false,
          // attributes: ["id","name"],
          where: whereOption,
          include: {
            model: AgentEnterprise,
            required: false,
            attributes: [
              [
                sequelize.literal(`(
                SELECT COUNT(DISTINCT agent_enterprise.id)
                FROM agent_enterprise AS agent_enterprise
                LEFT JOIN enterprise AS en
                ON agent_enterprise.enterprise_id = en.id
                WHERE
                agent_enterprise.is_active = ${IS_ACTIVE.ACTIVE}
                and agent_enterprise.enterprise_id = enterprise.id
                )`),
                'countAgent',
              ],
            ],
            where: { is_active: IS_ACTIVE.ACTIVE },
            // include: {
            //   model: Agent,
            //   required: false,
            //   where: { is_active: IS_ACTIVE.ACTIVE },
            //   include: {
            //     model: Wishlist,
            //     required: false,
            //     where: { is_active: IS_ACTIVE.ACTIVE, category_id: category_id ? { [Op.ne]: null } : { [Op.or]: idCategory } },
            //   }
            // }
          },
        },
        {
          model: ProductPrice,
          required: false,
          attributes: [
            [
              sequelize.literal(`(
                SELECT MAX(product_price.price)
                FROM product_price AS product_price
                WHERE
                product_price.is_active = ${IS_ACTIVE.ACTIVE}
                and ISNULL(product_price.agent_id)
                )`),
              'max_price',
            ],
          ],
          where: { is_active: IS_ACTIVE.ACTIVE, agent_id: null },
          limit: 1,
        },
        {
          model: ProductMedia,
          attributes: ['media_url'],
          required: false,
          where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
        },
      ],
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
  }

  /**
   * @summary Danh sach san pham cua toi
   *  @param {1|2} type - 1: sản phẩm của tôi, 2:sản phẩm phù hợp
   */
  @Security('jwt', ['agent'])
  @Get('/list-product-agent')
  public async listProductAgent(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('enterprise_id') enterprise_id?: number,
    @Query('search') search?: string,
    @Query('type') type?: number,
    @Query('category_id') category_id?: number,
    @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    // const schema = Joi.object({
    //   search: Joi.string().allow(null, ''),
    //   type: Joi.number().allow(null, ''),
    //   enterprise_id: Joi.number().allow(null, ''),
    //   category_id: Joi.number().allow(null, ''),
    // });
    // const { search, category_id, enterprise_id } = await schema.validateAsync(request);
    const loginUser = request.user?.data as AuthorizedUser;
    // return withSuccess(loginUser);
    const { offset, limit, page } = handlePagingMiddleware(request);
    let whereOption;
    if (type == 1) {
      whereOption = {
        id: enterprise_id ? enterprise_id : { [Op.ne]: null },
        is_active: IS_ACTIVE.ACTIVE,
      };
    }
    if (type == 2) {
      whereOption = {
        name: search ? { [Op.substring]: search } : { [Op.ne]: null },
        is_active: IS_ACTIVE.ACTIVE,
      };
    }
    // lấy thông tin agent
    const agentId = await Agent.findOne({
      where: { user_id: loginUser.id, is_active: IS_ACTIVE.ACTIVE },
    });
    // lấy thông tin level
    const levelId = await AgentEnterprise.findOne({
      where: { agent_id: agentId.id, is_active: IS_ACTIVE.ACTIVE },
    });
    // return withSuccess(levelId);
    let wishlistCategory = [];
    wishlistCategory = await Wishlist.findAll({
      where: { is_active: IS_ACTIVE.ACTIVE, agent_id: agentId.id },
    });
    const arrayCategory = wishlistCategory.map((element) => ({
      category_id: element.category_id,
    }));
    const idCategory = arrayCategory.map(function (item) {
      return item['category_id'];
    });
    // if (category_id) {
    //   category_id = category_id: category_id ? category_id : { [Op.in]: idCategory }
    // }
    const { count, rows } = await Product.findAndCountAll({
      attributes: [
        'id',
        'category_id',
        'name',
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'maxprice'],
        [sequelize.fn('MAX', sequelize.col('ProductPrices.percent')), 'maxpercent'],
        // [
        //   sequelize.literal(`(
        //           SELECT COUNT(DISTINCT agent_enterprise.id)
        //           FROM agent_enterprise AS agent_enterprise
        //           LEFT JOIN enterprise AS en
        //           ON agent_enterprise.enterprise_id = en.id
        //           WHERE
        //           agent_enterprise.is_active = ${IS_ACTIVE.ACTIVE}
        //           and agent_enterprise.enterprise_id = enterprise.id
        //           )`),
        //   'countAgent',
        // ],
      ],
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        category_id: type == 1 ? { [Op.ne]: null } : category_id ? category_id : { [Op.in]: idCategory },
      },
      include: [
        {
          model: Enterprise,
          // required: false,
          attributes: ['id', 'name'],
          where: whereOption,
        },
        {
          model: AgentProduct,
          required: false,
          attributes: ['id', 'name', 'description'],
          where: { is_active: IS_ACTIVE.ACTIVE, agent_id: type == 1 ? agentId.id : { [Op.ne]: null } },
        },
        {
          model: ProductPrice,
          // required: false,
          attributes: ['id', 'price', 'percent', 'agent_id'],
          where: {
            is_active: IS_ACTIVE.ACTIVE,
            agent_id: type == 1 ? agentId.id : { [Op.ne]: null },
            level_id: type == 1 ? levelId ? levelId.level_id : { [Op.ne]: null } : { [Op.ne]: null },
          },
          // limit: 1,
        },
        {
          // model: type == 1 ? AgentProductMedia : ProductMedia,
          model: ProductMedia,
          attributes: ['media_url'],
          required: false,
          where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
        },
      ],
      logging: console.log,
      group: ['Product.id', 'ProductPrices.tier_index'],
    });
    return withPagingSuccess(rows, { page: 1, totalItemCount: count, limit });
    // return withSuccess(1);
  }

  /**
   * @summary Danh SÁCH SẢN PHẨM
   */
  @Get('/list-product')
  public async listProduct(
    @Request() request: any,
    @Query('page') pageValue = 1,
    @Query('search') search?: string,
    @Query('category_id') category_id?: number,
    @Query('category_attribute_id') category_attribute_id?: number[],
    @Query('attribute_option_id') attribute_option_id?: number[],
    @Query('province_id') province_id?: number,
    @Query('district_id') district_id?: number,
    @Query('ward_id') ward_id?: number,
    @Query('time_type') time_type?: number,
    @Query('price_type') price_type?: number,
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const loginUser = request.user?.data as AuthorizedUser;
    const { offset, limit, page } = handlePagingMiddleware(request);
    let orders = [['id', 'DESC']];
    if (time_type == FILTER_TYPE.TIME_NEW_OLD && price_type == FILTER_TYPE.PRICE_MAX_MIN) {
      orders = [
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'DESC'],
        ['create_at', 'ASC'],
        // ['price', 'DESC'],
      ];
    }
    if (time_type == FILTER_TYPE.TIME_OLE_NEW && price_type == FILTER_TYPE.PRICE_MIN_MAX) {
      orders = [
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'ASC'],
        ['create_at', 'ASC'],
      ];
    }
    if (time_type == FILTER_TYPE.TIME_OLE_NEW && price_type == FILTER_TYPE.PRICE_MAX_MIN) {
      orders = [
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'DESC'],
        ['create_at', 'DESC'],
        // ['price', 'DESC'],
      ];
    }
    if (time_type == FILTER_TYPE.TIME_NEW_OLD && price_type == FILTER_TYPE.PRICE_MIN_MAX) {
      orders = [
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'ASC'],
        ['create_at', 'DESC'],
        // ['price', 'ASC'],
      ];
    }
    const productData = await Product.findAll({
      attributes: [
        'id',
        'category_id',
        'name',
        [sequelize.fn('MAX', sequelize.col('ProductPrices.price')), 'maxprice'],
        [sequelize.fn('MAX', sequelize.col('ProductPrices.percent')), 'maxpercent'],
      ],
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        category_id: category_id ? category_id : { [Op.ne]: null },
        status: PRODUCT_STATUS.ACTIVE,
      },
      include: [
        {
          model: Enterprise,
          // required: false,
          attributes: ['id', 'name'],
          where: { is_active: IS_ACTIVE.ACTIVE },
        },
        {
          model: ProductStock,
          // required: false,
          attributes: ['id', 'stock_id'],
          where: { is_active: IS_ACTIVE.ACTIVE },
          include: {
            model: Stock,
            // required: false,
            where: {
              is_active: IS_ACTIVE.ACTIVE,
              df_province_id: province_id ? province_id : { [Op.ne]: null },
              df_district: district_id ? district_id : { [Op.ne]: null },
              df_ward_id: ward_id ? ward_id : { [Op.ne]: null },
            },
          },
        },
        {
          model: Category,
          // required: false,
          attributes: ['id', 'name'],
          where: { is_active: IS_ACTIVE.ACTIVE, parent_id: null, id: category_id ? category_id : { [Op.ne]: null } },
          include: {
            model: CategoryAttribute,
            // required: false,
            attributes: ['id', 'name'],
            where: {
              is_active: IS_ACTIVE.ACTIVE,
              id: category_attribute_id ? { [Op.in]: category_attribute_id } : { [Op.ne]: null },
            },
            include: {
              model: AttributeOption,
              // required: false,
              attributes: ['id', 'name'],
              where: {
                is_active: IS_ACTIVE.ACTIVE,
                id: attribute_option_id ? { [Op.in]: attribute_option_id } : { [Op.ne]: null },
              },
            },
          },
        },
        {
          model: ProductPrice,
          // required: false,
          attributes: ['id', 'price', 'percent', 'agent_id'],
          where: {
            is_active: IS_ACTIVE.ACTIVE,
            agent_id: null,
            level_id: null,
          },
          // limit: 1,
        },
        {
          model: ProductMedia,
          attributes: ['media_url'],
          required: false,
          where: { is_active: IS_ACTIVE.ACTIVE, type: PRODUCT_MEDIA_TYPE.IMAGE },
        },
      ],
      // logging: console.log,
      group: ['Product.id', 'ProductPrices.tier_index', 'Category->CategoryAttributes->AttributeOptions.id'],
      order: orders,
    });
    return withPagingSuccess(productData, { page: 1, totalItemCount: productData.length, limit });
    // return withSuccess(1);
  }

  /**
   * @summary cập nhật hình hảnh và nội dung sản phẩm
   */
  @Put('/{agent_product_id}/agent/{agent_id}')
  public async updateMediaProductAgent(
    agent_id: number,
    agent_product_id: number,
    @Request() request: any,
    @Body()
    body: ProductRequestModel,
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    // return withSuccess(agent_id);
    const schema = Joi.object({
      array_delete_media: Joi.array().allow('', null),
      description: Joi.string().allow('', null),
    });
    const { array_delete_media, description } = await schema.validateAsync(body);
    const agentProduct = await AgentProduct.findOne({
      where: { id: agent_product_id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!agentProduct) throw new AppError(apiCode.DATA_NOT_EXIST);

    const data = await sequelize.transaction(async (transaction) => {
      await AgentProduct.update(
        { description: description },
        { where: { is_active: IS_ACTIVE.ACTIVE, id: agent_product_id, agent_id: agent_id }, transaction },
      );
      if (array_delete_media.length > 0) {
        await AgentProductMedia.update(
          { is_acive: IS_ACTIVE.INACTIVE },
          { where: { is_active: IS_ACTIVE.ACTIVE, id: { [Op.in]: array_delete_media } }, transaction },
        );
      }
    });

    return withSuccess(data);
  }
  /**
   * @summary Hủy đkí sản phẩm
   */
  @Delete('/{product_id}/agent/{agent_id}')
  public async deleteProductAgent(
    agent_id: number,
    product_id: number,
    @Request() request: any,
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const agentProduct = await AgentProduct.findOne({
      where: { product_id: product_id, agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE },
    });
    const agentProductPrice = await ProductPrice.findAll({
      where: { product_id: product_id, agent_id: agent_id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!agentProduct || !agentProductPrice) throw new AppError(apiCode.AGENT_PRODUCT_NOT_EXIST);

    const data = await sequelize.transaction(async (transaction) => {
      await AgentProduct.update(
        { is_active: IS_ACTIVE.INACTIVE },
        { where: { is_active: IS_ACTIVE.ACTIVE, product_id: product_id, agent_id: agent_id }, transaction },
      );
      await ProductPrice.update(
        { is_acive: IS_ACTIVE.INACTIVE },
        { where: { is_active: IS_ACTIVE.ACTIVE, product_id: product_id, agent_id: agent_id }, transaction },
      );
    });

    return withSuccess(data);
  }
  /**
   * @summary Sửa giá sản phẩm theo từng kho và thuộc tính
   */
  @Put('/update-price/{product_id}/agent/{agent_id}')
  public async updatePriceProductAgent(
    agent_id: number,
    product_id: number,
    @Request() request: any,
    @Body()
    body: { price_atrribute_option: any },
    // @Query('limit') limitValue = CONFIG.PAGING_LIMIT,
  ): Promise<SuccessResponseModel<any>> {
    const schema = Joi.object({
      price_atrribute_option: Joi.array()
        .items(
          Joi.object()
            .keys({
              product_price_id: Joi.number().integer().allow(null, ''),
              custom_attribute_option_1: Joi.number().integer().allow(null, ''),
              custom_attribute_option_2: Joi.number().integer().allow(null, ''),
              price: Joi.number().allow(null, ''),
              stock_id: Joi.number().allow(null, ''),
              level: Joi.number().allow(null, ''),
            })
            .unknown(true),
        )
        .required(),
    });
    const { price_atrribute_option } = await schema.validateAsync(body);

    const atributeOption = price_atrribute_option.map((element) => ({
      price: element.price,
      custom_attribute_option_id_1: element.custom_attribute_option_1,
      custom_attribute_option_id_2: element.custom_attribute_option_2,
      stock_id: element.stock_id,
      product_id: product_id,
      level: element.level,
      status: 1,
      agent_id: agent_id,
    }));
    const data = await sequelize.transaction(async (transaction) => {
      await ProductPrice.update(
        { is_active: IS_ACTIVE.INACTIVE },
        { where: { product_id: product_id, agent_id: agent_id } },
      );
      await ProductPrice.bulkCreate(atributeOption, { transaction });
    });
    return withSuccess(data);
  }

  /**
   * @summary Cập nhật hình ảnh cho sản phẩm
   * @param {1|2} type - 1: image, 2:video
   */
  // @Security('jwt', ['enterprise'])
  @Post('/{agent_product_id}/media/upload/{type}')
  public async uploadProductMedia(
    @Request() request: any,
    type: 1 | 2,
    agent_product_id: number,
  ): Promise<SuccessResponseModel<any>> {
    if (type == PRODUCT_MEDIA_TYPE.IMAGE) {
      await uploadMiddleware.handleSingleFile(request, 'image', type);
    } else if (type == PRODUCT_MEDIA_TYPE.VIDEO) {
      await uploadMiddleware.handleSingleFile(request, 'video', type);
    } else {
      throw new AppError(apiCode.INVALID_PARAM).with('Kiểu resource không hợp lệ');
    }
    // file will be in request.randomFileIsHere, it is a buffer
    const { filename, fieldname, destination, path } = (request as ProductMulterRequest).file;
    const baseUrl = getBaseServer(request);
    const url = `${baseUrl}/${path}`;
    const inserted = await AgentProductMedia.create({
      agent_product_id: agent_product_id,
      media_url: path,
      type: type,
    });
    return withSuccess({
      filename: filename,
      url: url,
      path,
      id: inserted.id,
      type: inserted.type,
      agent_product_id: agent_product_id,
    });
  }

  /**
   * @summary Đăng kí sản phẩm
   */
  @Security('jwt', ['agent'])
  @Post('{product_id}/product-registration')
  public async productRegistration(@Request() request: any, product_id: number): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(loggedInUser);
    const agentId = await Agent.findOne({ where: { user_id: loggedInUser.id, is_active: IS_ACTIVE.ACTIVE } });
    const agentProduct = await AgentProduct.findOne({
      where: { agent_id: agentId.id, is_active: IS_ACTIVE.ACTIVE, product_id: product_id },
    });
    // const checkProductAgent = AgentProduct.findAll({
    //   where: { agent_id: agentId.id, product_id: product_id, is_active: IS_ACTIVE.ACTIVE },
    // });
    if (agentProduct) throw apiCode.REGISTER_PRODUCT_EXITS;
    const checkProduct = await Product.findOne({
      where: {
        id: product_id,
        is_active: IS_ACTIVE.ACTIVE,
      },
    });
    if (!checkProduct) throw apiCode.PRODUCT_NOT_EXIST;
    // return withSuccess(checkProduct);
    // lấy level của enterprise và lấy mặc định lv đầu
    const levelId = await Level.findAll({
      atrribute: [sequelize.fn('MIN', sequelize.col('revenue_limit'))],
      where: { enterprise_id: checkProduct.enterprise_id, is_active: IS_ACTIVE.ACTIVE },
    });
    // check agent đã đkí nhà cung cấp đó hay chưa
    const agentEnter = await AgentEnterprise.findAll({
      where: { agent_id: agentId.id, is_active: IS_ACTIVE.ACTIVE, enterprise_id: checkProduct.enterprise_id },
    });

    await sequelize.transaction(async (transaction) => {
      if (agentEnter == null) {
        await AgentEnterprise.create(
          {
            enterprise_id: checkProduct.enterprise_id,
            agent_id: agentId.id,
            type: 1,
            level_id: levelId[0].level_id,
          },
          { transaction },
        );
      }
    });
    const midQueryProduct = `
    INSERT INTO agent_product
    (agent_id, name, product_id,description,status)
    SELECT
       ${agentId.id} agent_id, name, id,description,status
    FROM
    product
    WHERE
    id = :product_id
    `;
    const queryPrice = await sequelize.query(midQueryProduct, {
      replacements: {
        product_id: product_id,
      },
    });
    const midQueryPrice = `
    INSERT INTO product_price
    (product_id, stock_id, price, custom_attribute_option_id_1,custom_attribute_option_id_2,status,is_active,agent_id,level_id,tier_index,percent)
    SELECT
        product_id, stock_id, price, custom_attribute_option_id_1,custom_attribute_option_id_2,status,is_active, ${agentId.id} as agent_id,level_id,tier_index,percent
    FROM
    product_price
    WHERE
    product_id = :product_id
    `;
    const midQueryMedia = `
    INSERT INTO agent_product_media
    (agent_product_id, media_url, type, display_order,is_active, product_custom_attribute_option_id)
    SELECT
        ${queryPrice[0]} as product_id, media_url, type, display_order,is_active, product_custom_attribute_option_id
    FROM
    product_media
    WHERE
    product_id = :product_id
    `;
    const queryOrderAfter = await sequelize.query(midQueryPrice, {
      logging: console.log,
      replacements: {
        product_id: product_id,
      },
    });
    const queryMedia = await sequelize.query(midQueryMedia, {
      replacements: {
        product_id: product_id,
      },
    });
    return withSuccess(queryPrice[0]);
  }
}
