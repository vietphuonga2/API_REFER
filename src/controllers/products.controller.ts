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

import { handlePagingMiddleware } from '@middleware/pagingMiddleware';

import { ApplicationController } from './';
import { product, productDetail } from './mock/products';
import {
  apiCode,
  IS_ACTIVE,
  PRODUCT_ORDER_TYPE,
  PRODUCT_MEDIA_TYPE,
  ROLE_NAMES,
  AppError,
  PRODUCT_PRICE_STATUS,
  PRODUCT_STATUS,
  SHIPPING_TYPE,
  STOKE_STATUS,
} from '@commons/constant';
import { AuthorizedUser } from '@commons/types';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import * as productService from '@services/products.service';
import {
  ProductGeneralRequestModel,
  ProductGeneralRequestSchema,
  ProductCodeSchema,
  ProductAttributeRequestModel,
  AttributeRequestSchema,
  ProductStatus,
  ProductGeneralRequestModelCode,
  ProductGeneralRequestModelStatus,
} from './models/ProductModel';
import * as ProductService from '../services/products.service';
import * as express from 'express';
import { getBaseServer } from '@helpers/requestHelper';
import { IndexHints } from 'sequelize/types';
import { includes } from 'lodash';

const db = require('@models');
const {
  sequelize,
  Sequelize,
  ProductCustomAttribute,
  Product,
  ProductMedia,
  Category,
  ProductStock,
  Stock,
  User,
  Order,
  OrderItem,
  Agent,
  AgentProduct,
  AgentEnterprise,
  ProductPrice,
  ProductAttribute,
  ProductCustomAttributeOption,
  DFShipmerchant,
  ProductShipMerchant
} = db.default;
const { Op } = Sequelize;
interface ProductMulterRequest extends express.Request {
  file: any;
}

@Route('product')
@Tags('product')
export class ProductController extends ApplicationController {
  constructor() {
    super('Product');
  }

  @Security('jwt', ['enterprise'])
  @Get('/')
  public async listProducts(
    @Request() request: any,
    @Query() search?: string,
    @Query() status?: number,
    @Query() category_id?: number,
    @Query() is_public?: number,
  ): Promise<PagingResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);
    const loggedInUser = request.user.data;

    const whereOptions: any = {
      is_active: IS_ACTIVE.ACTIVE,
      enterprise_id: loggedInUser.enterprise_id,
      ...(search && { [Op.or]: { name: { [Op.like]: `%${search}%` }, code: { [Op.like]: `%${search}%` } } }),
    };
    if (!_.isNil(status)) {
      whereOptions.status = status;
    }
    if (!_.isNil(is_public)) {
      whereOptions.is_public = is_public;
    }
    const { rows, count } = await Product.findAndCountAll({
      attributes: {
        include: [[Sequelize.fn('COUNT', 'product_prices.id'), 'stock_status']],
      },
      where: whereOptions,
      ...(category_id && { include: [{ model: Category, where: { id: category_id } }] }),
      include: [
        {
          required: false,
          model: Category,
          attributes: ['id', 'name', 'parent_id', 'icon_url'],
          include: { model: Category, as: 'parent_category', attributes: ['id', 'name', 'parent_id', 'icon_url'] },
        },
        { model: ProductMedia, required: false },
        {
          model: ProductPrice,
          required: false,
          where: { is_active: IS_ACTIVE.ACTIVE, status: PRODUCT_PRICE_STATUS.AVAILABLE },
        },
      ],
      group: ['product.id'],
      limit,
      offset,
      logging: console.log,
    });
    return withPagingSuccess(rows, { page, limit, totalItemCount: _.isArray(count) ? count.length : count });
  }

  @Get('/check-code')
  public async checkProductCodeExist(@Query() code: string): Promise<SuccessResponseModel<any>> {
    const foundProduct = await ProductService.isProductCodeExist(code);
    return withSuccess(!!foundProduct);
  }

  /**
   * @summary Tạo sản phẩm - thông tin chung
   */
  @Security('jwt', ['enterprise'])
  @Post('/')
  public async createProductGeneralInfo(
    @Request() request: any,
    @Body() body: ProductGeneralRequestModel & ProductGeneralRequestModelCode & ProductAttributeRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    // Note: thiếu check gói ( nếu gói phần mềm có số lượng sp quá thì thông báo lỗi)

    // Nếu tk là gói mua phần mềm : mặc định sp là nội bộ
    // Nếu tk là gói giao dịch thì được phép chọn công khai hoặc nội bộ

    const bodyData = await ProductGeneralRequestSchema.concat(ProductCodeSchema)
      .concat(AttributeRequestSchema)
      .validateAsync(body, {
        allowUnknown: false,
      });

    bodyData.enterprise_id = loggedInUser.enterprise_id;

    const foundProduct = await ProductService.isProductCodeExist(bodyData.code);
    if (foundProduct) {
      throw new AppError(apiCode.DATA_EXIST);
    }

    // TODO: validate attribute belong to category

    const myStock = await Stock.findAll({
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        enterprise_id: loggedInUser.enterprise_id,
      },
    });
    const createdProduct = await sequelize.transaction(async (transaction) => {
      const createdProduct = await Product.create(bodyData, { transaction });
      if (myStock.length > 0) {
        const stockContents = myStock.map((v) => ({ stock_id: v.id, product_id: createdProduct.id }));
        await ProductStock.bulkCreate(stockContents, { transaction });
      }
      const atributeOption = bodyData.attributes.map((element) => ({
        category_attribute_id: element.attribute_id,
        value: element.value,
        category_attribute_option_id: element.attribute_option_id || null,
        product_id: createdProduct.id,
      }));
      await ProductAttribute.bulkCreate(atributeOption, { transaction });
      return createdProduct;
    });
    return withSuccess(createdProduct);
  }

  /**
   * @summary Thêm kho hàng cho sản phẩm
   * @param  {number[]} stock_ids
   * */
  @Security('jwt', ['enterprise'])
  @Post('/{id}/stock')
  public async updateProductStocks(@Request() request, id: number, @Body() body: { stock_ids: number[] }) {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    const schema = Joi.object({
      stock_ids: Joi.array().items(Joi.number()).required(),
    });
    const product = Product.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } });
    if (!product) throw apiCode.NOT_FOUND;
    const bodyData = await schema.validateAsync(body);
    const items = bodyData.stock_ids.map((v) => ({ product_id: id, stock_id: v }));
    // return withSuccess(items);
    // const update = ProductStock.create({ is_active: IS_ACTIVE.INACTIVE }, { where: { id: { [Op.in]: bodyData.stock_ids } } });
    const insertedItems = await ProductStock.bulkCreate(items);
    return withSuccess(insertedItems);
  }

  /**
   * @summary Danh sách kho hàng hiện tại của sản phẩm
   */
  @Security('jwt', ['enterprise'])
  @Get('/{id}/stock')
  public async listProductStocks(
    @Request() request,
    id: number,
    @Query() excluded = 0,
  ): Promise<PagingResponseModel<any>> {
    const { offset, limit, page } = handlePagingMiddleware(request);
    const loggedInUser = request?.user?.data as AuthorizedUser;

    const { rows, count } = await Stock.findAndCountAll({
      where: { is_active: IS_ACTIVE.ACTIVE },
      include: [
        { model: ProductStock, where: { is_active: IS_ACTIVE.ACTIVE, product_id: id, status: STOKE_STATUS.ACTIVE } },
      ],
      limit,
      offset,
    });
    return withPagingSuccess(rows, { page, limit, totalItemCount: count });
  }
  /**
   * @summary Xoá kho hàng cho sản phẩm
   * @param  {number[]} stock_ids
   *
   */
  @Security('jwt', ['enterprise'])
  @Delete('/{id}/stock')
  public async deleteProductStocks(@Request() request, id: number, @Body() body: { stock_ids: number[] }) {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const schema = Joi.object({
      stock_ids: Joi.array().items(Joi.number()).required(),
    });
    const bodyData = await schema.validateAsync(body);
    // const items = bodyData.stock_ids.map((v) => ({ product_id: id, stock_id: v }));
    const update = await ProductStock.update(
      { is_active: IS_ACTIVE.INACTIVE },
      { where: { is_active: IS_ACTIVE.ACTIVE, product_id: id, id: { [Op.in]: bodyData.stock_ids } } },
    );
    return withSuccess(update);
  }

  /**
   * @summary Danh sách thuộc tính product custom
   *
   */
  @Get('/{id}/product-custom-atrribute')
  public async listProductCustom(@Request() request, id: number): Promise<SuccessResponseModel<any>> {
    const listProductCustom = await ProductCustomAttribute.findAll(
      {
        where: {
          is_active: IS_ACTIVE.ACTIVE,
          product_id: id
        },
        include: {
          model: ProductCustomAttributeOption,
          where: { is_active: IS_ACTIVE.ACTIVE }
        },
        order: [["id", "asc"]],
        limit: 1,
      },
    );
    return withSuccess(listProductCustom);
  }

  /**
   * @summary Cập nhật hình ảnh cho sản phẩm
   * @param {1|2} type - 1: image, 2:video
   */
  // @Security('jwt', ['enterprise'])
  @Post('/{id}/media/upload/{type}')
  public async uploadProductMedia(
    @Request() request: any,
    type: 1 | 2,
    id: number,
    @Body() body: { product_custom_attribute_option_id?: number, url?: string },
    // @Query() product_custom_attribute_option_id?: number,
    // @Query() url?: string,
  ): Promise<SuccessResponseModel<any>> {
    // const bodyData = await ProductGeneralRequestSchema.concat(ProductStatus).validateAsync(body, {
    //   allowUnknown: false,
    // });
    // if (type == PRODUCT_MEDIA_TYPE.IMAGE) {
    //   await uploadMiddleware.handleSingleFile(request, 'image', type);
    // } else if (type == PRODUCT_MEDIA_TYPE.VIDEO) {
    //   await uploadMiddleware.handleSingleFile(request, 'video', type);
    // } else {
    //   throw new AppError(apiCode.INVALID_PARAM).with('Kiểu resource không hợp lệ');
    // }
    // file will be in request.randomFileIsHere, it is a buffer
    // const { filename, fieldname, destination, path } = (request as ProductMulterRequest).file;
    const baseUrl = getBaseServer(request);
    const url_media = `${baseUrl}/${body.url}`;
    const inserted = await ProductMedia.create({ product_id: id, media_url: url_media, type: type, product_custom_attribute_option_id: body.product_custom_attribute_option_id ? body.product_custom_attribute_option_id : null });
    return withSuccess({ url: url_media, id: inserted.id, type: inserted.type, product_id: id });
  }

  @Security('jwt', ['enterprise'])
  @Put('/{id}/media/order')
  public async updateMediaDisplayOrder(
    @Request() request: any,
    id: number,
    @Body() body: { media_ids: number[] },
  ): Promise<SuccessResponseModel<any>> {
    const mediaItems = body.media_ids.map((v, index) => ({ id: v, display_order: index + 1 }));

    await sequelize.transaction(async (transaction) => {
      await ProductMedia.bulkCreate(mediaItems, { transaction, updateOnDuplicate: ['display_order'] });
    });
    return withSuccess({});
  }

  /**
   * @summary Giá sản phẩm
   */
  @Security('jwt', ['enterprise'])
  @Post('/{id}/price')
  public async createPrice(
    @Request() request,
    id: number,
    // @Body()
    // body: {
    //   filed_type: 1 | 0;
    //   base_price: number;
    //   product_custom_attribute?: {
    //     name: string;
    //     product_group_items?: string[];
    //   }[];
    //   items: {
    //     stock_id: number;
    //     price: number;
    //     tier_index?: number[];
    //     level_id?: number;
    //     stock_status: 1 | 0;
    //     // custom_attribute_option_1?: number;
    //     // custom_attribute_option_2?: number;
    //   }[];
    // },
  ) {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    const schema = Joi.object({
      base_price: Joi.number(),
      filed_type: Joi.number().empty([null, 'null']).default(0).valid(1, 0),
      product_custom_attribute: Joi.array()
        .items(
          Joi.object()
            .keys({
              name: Joi.string().required(),
              product_group_items: Joi.array().required(),
            })
            .unknown(true),
        )
        .required(),
      items: Joi.array().items(
        Joi.object()
          .keys({
            stock_id: Joi.number().integer().required(),
            tier_index: Joi.array().items(Joi.number().integer()).required(),
            price: Joi.number().integer().required(),
            level_id: Joi.number().allow(null, ''),
            stock_status: Joi.number().empty([null, 'null']).default(0).valid(1, 0),
            // custom_attribute_option_1: Joi.number().integer().allow(null, ''),
            // custom_attribute_option_2: Joi.number().integer().allow(null, '')
          })
          .unknown(true),
      ),
    });
    const { items, base_price, filed_type, product_custom_attribute } = await schema.validateAsync(request.body);
    // return withSuccess(product_custom_attribute);
    let productCustom = [];
    const data = await sequelize.transaction(async (transaction) => {
      await Promise.all([
        // create group product
        (productCustom = await ProductCustomAttribute.bulkCreate(
          product_custom_attribute.map((group) => ({ name: group.name, product_id: id })),
          { transaction },
        )),
      ]);
      const productCustomAtt = [];
      product_custom_attribute.forEach((group, groupIndex) => {
        group.product_group_items.forEach((item, index) => {
          productCustomAtt.push({
            name: item,
            display_order: index,
            product_custom_attribute_id: productCustom[groupIndex].id,
            group: groupIndex,
            product_id: id,
            create_by: loggedInUser.enterprise_id,
          });
        });
      });
      const newProductCustomAttribute = await ProductCustomAttributeOption.bulkCreate(productCustomAtt, {
        transaction,
      });
      const productProductCustomAttributeObject = {};

      productCustomAtt.forEach((item, index) => {
        if (!productProductCustomAttributeObject[item.group]) productProductCustomAttributeObject[item.group] = {};
        productProductCustomAttributeObject[item.group][item.display_order] = newProductCustomAttribute[index].id;
      });

      const atributeOption = items.map((model) => ({
        ...model,
        product_id: id,
        custom_attribute_option_id_1: productProductCustomAttributeObject['0']
          ? productProductCustomAttributeObject['0'][model.tier_index[0]]
          : null,
        custom_attribute_option_id_2: productProductCustomAttributeObject['1']
          ? productProductCustomAttributeObject['1'][model.tier_index[1]]
          : null,
        tier_index: model.tier_index,
        create_by: loggedInUser.enterprise_id,
      }));

      // create product details
      await ProductPrice.bulkCreate(atributeOption, { transaction });
      // await ProductPrice.update(
      //   { is_active: IS_ACTIVE.INACTIVE },
      //   { where: { product_id: id, agent_id: { [Op.is]: null } } },
      // );
      // return await ProductPrice.bulkCreate(atributeOption, { transaction });
    });
    return withSuccess(data);
  }

  @Put('/{id}/')
  public async updateCategory(
    @Body() body: { name: string; parent_id: number; display_order: number; icon_url: string },
  ): Promise<SuccessResponseModel<any>> {
    return withSuccess(productDetail[0]);
  }

  @Security('jwt')
  @Put('/{id}/change-status')
  public async changeStatus(@Body() body: { status: number }): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  /**
   * @summary Chi tiết sản phẩm (cho enterprise)
   */
  @Get('/{id}')
  public async detailProduct(@Request() request, id: number): Promise<SuccessResponseModel<any>> {
    const detailProduct = await productService.findById(id);
    return withSuccess(detailProduct);
  }

  /**
   * @summary Vận chuyển
   */

  @Security('jwt', ['enterprise'])
  @Put('/{id}/shipping')
  public async updateShipping(
    @Request() request,
    id: number,
    @Body()
    body: {
      weight?: number;
      height?: number;
      length?: number;
      width?: number;
      is_ship_type?: number;
      unit_shipping?: number[];
    },
  ) {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const schema = Joi.object({
      weight: Joi.number().required(),
      height: Joi.number().required(),
      length: Joi.number().required(),
      width: Joi.number().required(),
      is_ship_type: Joi.number().required(),
      unit_shipping: Joi.array().allow('', null),
    });
    const bodyData = await schema.validateAsync(body);
    const product = await Product.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, id, status: PRODUCT_STATUS.PENDING },
      order: [['id', 'desc']],
    });
    if (!product) throw apiCode.NOT_FOUND;
    if (bodyData.weight == 0 || bodyData.height == 0 || bodyData.length == 0 || bodyData.width == 0)
      throw apiCode.PROFILE_EXIST;
    if (
      bodyData.weight <= 0 ||
      bodyData.weight > 5000000 ||
      bodyData.height <= 0 ||
      bodyData.height > 5000000 ||
      bodyData.length <= 0 ||
      bodyData.length > 5000000 ||
      bodyData.width <= 0 ||
      bodyData.width > 5000000
    )
      throw apiCode.PRODUCT_SHIPPING;

    // Update thông số
    // đơn vị vận chuyển
    if (bodyData.is_ship_type == SHIPPING_TYPE.VC) {
      if (bodyData.unit_shipping.length == 0) throw apiCode.UNIT_SIPPING_EXITS;
      const checkShip = await DFShipmerchant.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, id: { [Op.in]: bodyData.unit_shipping } } });
      if (checkShip.length < bodyData.unit_shipping.length) throw apiCode.SHIP_MERCHANT_EXIT;
    }
    let listShip = [];
    bodyData.unit_shipping.forEach((item) => {
      listShip.push({ product_id: id, ship_merchant_id: item });
    });
    const data = await sequelize.transaction(async (transaction) => {
      if (listShip.length == 0) await ProductShipMerchant.bulkCreate(listShip, { transaction });
      await Product.update(
        {
          is_active: IS_ACTIVE.ACTIVE,
          status: PRODUCT_STATUS.ACTIVE,
          weight: bodyData.weight,
          height: bodyData.height,
          length: bodyData.length,
          width: bodyData.width,
          is_ship_type: bodyData.is_ship_type,
        },
        { where: { id, status: bodyData.is_ship_type != 0 ? PRODUCT_STATUS.ACTIVE : PRODUCT_STATUS.PENDING }, transaction },
      );

    });
    return withSuccess(data);
  }

  @Delete('/{id}')
  public async deleteProduct(): Promise<SuccessResponseModel<any>> {
    return withSuccess(null);
  }

  // SỬA SẢN PHẨM

  /**
   * @summary Sửa sản phẩm - thông tin chung
   */
  // @Security('jwt', ['enterprise'])
  @Put('/:id/detail')
  public async updateProductGeneralInfo(
    id,
    @Request() request: any,
    @Body() body: ProductGeneralRequestModel & ProductGeneralRequestModelStatus & ProductAttributeRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    // const loggedInUser = request?.user?.data as AuthorizedUser;
    // return withSuccess(id);
    const bodyData = await ProductGeneralRequestSchema.concat(ProductStatus).validateAsync(body, {
      allowUnknown: false,
    });

    // bodyData.enterprise_id = loggedInUser.enterprise_id;
    // return withSuccess(bodyData);
    // kiểm tra is_public ( loại sản phẩm công khai/ nội bộ)
    /**
     * Nếu Tài khoản Enterprise đang sử dụng GÓI MUA PHẦN MỀM  Loại sản phẩm mặc định = Nội bộ, disable, không được chỉnh sửa.
     * Nếu Tài khoản Enterprise đang sử dụng GÓI GIAO DỊCH  Loại sản phẩm có thể chọn Công khai hoặc nội bộ
     * Tất cả các địa chỉ trong Thông tin giá bán đều để Ngừng bán. Sản phẩm không hiển thị trên app CTV với cả CTV đã hoặc chưa đăng ký sản phẩm.
      -	Với CTV đã đăng ký sản phẩm  Thông báo” Sản phẩm A đã ngừng hoạt động”
      -	Với những đơn hàng chưa hoàn thành thì vẫn hoạt động bình thường, CTV có thể xử lý đơn hàng bình thường
      Hết hàng => còn hàng: hiển thị sản phẩm trên app CTV
     */

    // Kiểm tra status
    /**
     * Đang hoạt động, Ngừng hoạt động. hiển thị trạng thái tương ứng với trạng thái hiện tại của sản phẩm
      -	Đang hoạt động chuyển thành Ngừng hoạt động  Ngừng hoạt động sản phẩm, không hiển thị sản phẩm trong app CTV với cả CTV đã đăng ký và chưa đăng ký sản phẩm
      -	Với CTV đã đăng ký sản phẩm  Thông báo” Sản phẩm A đã ngừng hoạt động”
      -	Với những đơn hàng chưa hoàn thành thì vẫn hoạt động bình thường, CTV có thể xử lý đơn hàng bình thường
      -	Ngừng hoạt động  đang hoạt động: hiển thị sản phẩm trên app CTV
     *
     */

    // Kiểm tra row status ( trạng thái hàng ) update lại status của tất cả kho ( trong product_store)
    /**
     * o	Còn hàng  hết hàng: Tất cả các địa chỉ trong Thông tin giá bán đều để Ngừng bán. Sản phẩm không hiển thị trên app CTV với cả CTV đã hoặc chưa đăng ký sản phẩm.
        	Với CTV đã đăng ký sản phẩm  Thông báo” Sản phẩm A đã ngừng hoạt động”
        	Với những đơn hàng chưa hoàn thành thì vẫn hoạt động bình thường, CTV có thể xử lý đơn hàng bình thường
        o	Hết hàng  còn hàng: hiển thị sản phẩm trên app CTV
     *
     */
    // const updateStatus = await ProductStock.update({ status: STOKE_STATUS.INACTIVE }, { where: { product_id: id, is_active: IS_ACTIVE.ACTIVE } })

    // const foundProduct = await ProductService.isProductCodeExist(bodyData.code);
    // if (foundProduct) {
    //   throw new AppError(apiCode.DATA_EXIST);
    // }

    // TODO: validate attribute belong to category
    const updateProduct = await sequelize.transaction(async (transaction) => {
      const product = Product.update(
        {
          name: bodyData.name,
          is_public: bodyData.is_public,
          order_type: bodyData.order_type,
          category_id: bodyData.category_id,
          description: bodyData.description,
          status: bodyData.status,
        },
        { where: { is_active: IS_ACTIVE.ACTIVE, id }, transaction },
      );
      await ProductStock.update(
        { status: STOKE_STATUS.INACTIVE },
        { where: { product_id: id, is_active: IS_ACTIVE.ACTIVE }, transaction },
      );
    });
    return withSuccess(updateProduct);
  }

  /**
   * @summary Sửa sản phẩm - giá sản phẩm
   */
  // @Security('jwt', ['enterprise'])
  @Put('/:id/update-price')
  public async updatePrice(
    @Request() request,
    id: number,
    // @Body() body: ProductGeneralRequestModel & ProductGeneralRequestModelStatus & ProductAttributeRequestModel,
  ): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;

    const schema = Joi.object({
      base_price: Joi.number(),
      filed_type: Joi.number().empty([null, 'null']).default(0).valid(1, 0),
      product_custom_attribute: Joi.array()
        .items(
          Joi.object()
            .keys({
              name: Joi.string().required(),
              product_group_items: Joi.array().required(),
            })
            .unknown(true),
        )
        .required(),
      items: Joi.array().items(
        Joi.object()
          .keys({
            stock_id: Joi.number().integer().required(),
            tier_index: Joi.array().items(Joi.number().integer()).required(),
            price: Joi.number().integer().required(),
            level_id: Joi.number().allow(null, ''),
            stock_status: Joi.number().empty([null, 'null']).default(0).valid(1, 0),
            // custom_attribute_option_1: Joi.number().integer().allow(null, ''),
            // custom_attribute_option_2: Joi.number().integer().allow(null, '')
          })
          .unknown(true),
      ),
    });
    const { items, base_price, filed_type, product_custom_attribute } = await schema.validateAsync(request.body);

    let checkProduct;
    let productPrices;
    await Promise.all([
      (checkProduct = await Product.findOne({ where: { id, is_active: IS_ACTIVE.ACTIVE } })),
      (productPrices = await ProductPrice.findAll({ where: { product_id: id, is_active: IS_ACTIVE.ACTIVE } })),
    ]);
    // return withSuccess(checkProduct);

    if (!checkProduct) throw apiCode.NOT_FOUND;

    const updateProductPrices = productPrices
      .filter((item1) => !items.some((item2) => item1.id == item2.id && item1.price == item2.price))
      .map((item) => item.id);

    const deleteProductPrices = productPrices
      .filter((item1) => !items.some((item2) => item1.id == item2.id))
      .map((item) => item.id);
    // return withSuccess({ updateProductPrices, deleteProductPrices });
    await sequelize.transaction(async (transaction) => {
      let productCustom = [];

      await Promise.all([
        Product.update(
          {
            base_price,
            filed_type,
          },
          { where: { id }, transaction },
        ),
        // delete old image product
        // ProductMedia.update({ is_active: IS_ACTIVE.INACTIVE }, { where: { product_id: id }, transaction }),
        // delete old group product
        ProductCustomAttribute.update({ is_active: IS_ACTIVE.INACTIVE }, { where: { product_id: id }, transaction }),
        // delete old product details
        ProductPrice.update({ is_active: IS_ACTIVE.INACTIVE }, { where: { product_id: id }, transaction }),
        // productService.handleNotiUpdateProductDetails(updateProductDetails, transaction),
        // productService.handleDeleteProductDetails(deleteProductDetails, transaction),
        // productService.handleNotiUpdateAmountOfProduct(id, oldProductDetails, product_details, transaction),
      ]);
      await Promise.all([
        // create group product
        (productCustom = await ProductCustomAttribute.bulkCreate(
          product_custom_attribute.map((group) => ({ name: group.name, product_id: id })),
          { transaction },
        )),
      ]);
      const productCustomAtt = [];
      product_custom_attribute.forEach((group, groupIndex) => {
        group.product_group_items.forEach((item, index) => {
          productCustomAtt.push({
            name: item,
            display_order: index,
            product_custom_attribute_id: productCustom[groupIndex].id,
            group: groupIndex,
            product_id: id,
            // create_by: loggedInUser.enterprise_id,
          });
        });
      });
      const newProductCustomAttribute = await ProductCustomAttributeOption.bulkCreate(productCustomAtt, {
        transaction,
      });
      const productProductCustomAttributeObject = {};

      productCustomAtt.forEach((item, index) => {
        if (!productProductCustomAttributeObject[item.group]) productProductCustomAttributeObject[item.group] = {};
        productProductCustomAttributeObject[item.group][item.display_order] = newProductCustomAttribute[index].id;
      });

      const atributeOption = items.map((model) => ({
        ...model,
        product_id: id,
        custom_attribute_option_id_1: productProductCustomAttributeObject['0']
          ? productProductCustomAttributeObject['0'][model.tier_index[0]]
          : null,
        custom_attribute_option_id_2: productProductCustomAttributeObject['1']
          ? productProductCustomAttributeObject['1'][model.tier_index[1]]
          : null,
        tier_index: model.tier_index,
        // create_by: loggedInUser.enterprise_id,
      }));
      await ProductPrice.bulkCreate(atributeOption, {
        updateOnDuplicate: [
          'id',
          'update_ay',
          'create_at',
          'is_active',
          'product_id',
          'store_id',
          'price',
          'custom_attribute_option_id_1',
          'custom_attribute_option_id_2',
          'tier_index',
          'agent_id',
          'level_id',
        ],
        transaction,
      });
    });
    const detailProduct = await productService.findById(id);
    return withSuccess(detailProduct);
  }

  @Security('jwt', ['enterprise'])
  @Get('/:id/agents/registered')
  public async listRegisterAgents(@Request() request: any, id: number): Promise<PagingResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const { offset, limit, page } = handlePagingMiddleware(request);

    await productService.checkExistProduct(id);
    const { rows, count } = await Agent.findAndCountAll({
      include: [
        { model: AgentProduct, where: { product_id: id }, attributes: ['agent_id', ['create_at', 'registered_date']] },
        { model: AgentEnterprise, required: false, attributes: ['enterprise_id', 'type'] },
        { model: User, attributes: ['id', 'name'] },
      ],
      limit,
      offset,
    });
    return withPagingSuccess(rows, { page, totalItemCount: count, limit });
  }

  @Security('jwt', ['enterprise'])
  @Get('/:id/agents/sold')
  public async listSoldAgents(@Request() request: any, id: number): Promise<PagingResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const { offset, limit, page } = handlePagingMiddleware(request);

    await productService.checkExistProduct(id);
    const { rows, count } = await Agent.findAndCountAll({
      subQuery: false,
      attributes: {
        include: [
          [sequelize.fn('sum', sequelize.col('Orders->OrderItems.quantity')), 'total_sold_count'],
          [sequelize.fn('sum', sequelize.col('Orders->OrderItems.agent_price')), 'total_revenue'],
          [
            sequelize.literal('sum(`Orders->OrderItems`.agent_price - `Orders->OrderItems`.discount_price)'),
            'total_commission',
          ],
        ],
      },
      include: [
        { model: AgentProduct, where: { product_id: id }, attributes: [['create_at', 'registered_date']] },
        { model: AgentEnterprise, required: false, attributes: ['id', 'type'] },
        { model: User, attributes: ['id', 'name'] },
        {
          attributes: [],
          required: true,
          model: Order,
          // attributes: [
          //   [sequelize.fn('sum', sequelize.col('Orders->OrderItems.quantity')), 'sold_count'],
          //   [sequelize.fn('sum', sequelize.col('Orders->OrderItems.agent_price')), 'revenue'],
          //   [
          //     sequelize.literal('sum(`Orders->OrderItems`.agent_price - `Orders->OrderItems`.discount_price)'),
          //     'commission',
          //   ],
          // ],
          include: [{ model: OrderItem, where: { product_id: id } }],
        },
      ],
      limit,
      offset,
      group: ['Agent.id'],
    });
    return withPagingSuccess(rows, { page, totalItemCount: count.length, limit });
  }

  @Security('jwt', ['enterprise'])
  @Get('/:id/sale-overview')
  public async productSaleStatistic(@Request() request: any, id: number): Promise<SuccessResponseModel<any>> {
    const loggedInUser = request?.user?.data as AuthorizedUser;
    const { offset, limit, page } = handlePagingMiddleware(request);

    return withSuccess({
      gross_revenue: 50000000,
      gross_profit: 10000000,
      registered_agent_count: 200,
      sold_agent_count: 326,
      sold_count: 50,
    });
  }
}
