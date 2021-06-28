import {
  IS_ACTIVE,
  AGENT_ENTERPRISE_STATUS,
  PRODUCT_PRICE_STATUS,
  GENDER,
  AGENT_TYPE,
  ENTERPRISE_STATUS,
  CONFIG,
  ROLE,
  apiCode,
  AppError,
} from '@commons/constant';

const db = require('@models');
const {
  sequelize,
  Sequelize,
  Enterprise,
  Product,
  Category,
  ProductMedia,
  ProductPrice,
  ProductAttribute,
  CategoryAttribute,
  AttributeOption,
  ProductCustomAttributeOption,
  ProductCustomAttribute,
  Stock,

} = db.default;
const { Op } = Sequelize;

export async function isProductCodeExist(code: string): Promise<any> {
  const foundEnterprise = await Product.findOne({
    attributes: ['id', 'code'],
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  return foundEnterprise;
}

export async function findById(id: number): Promise<any> {
  return await Product.findOne({
    attributes: {
      // include: [
      //   [
      //     sequelize.literal(`(
      //         select group_concat(attributes.att_name separator '. ') as all_att
      //   from (
      //   select concat(att.name, ":" ,group_concat(DISTINCT cat.name separator ', ')) as att_name, att.name as catname, concat(cat.name) attribute_name,pro_att.category_attribute_id, pro_att.value, pro_att.product_id as product_att_id, cat.* FROM product_attribute as pro_att
      //   join category_attribute att on pro_att.category_attribute_id = att.id
      //   join attribute_option cat on pro_att.category_attribute_option_id = cat.id
      //       where product_id = ${id}
      //   group by pro_att.category_attribute_id
      //       ) as attributes
      //       group by attributes.product_att_id
      //           )`),
      //     'attribute_product',
      //   ],
      // ],
    },
    where: { id, is_active: IS_ACTIVE.ACTIVE },
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
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT stock.name as stock_name
                FROM stock
                WHERE
                stock.is_active = ${IS_ACTIVE.ACTIVE}
                and stock.id = ProductPrices.stock_id
                )`),
              'stock_name',
            ],
          ],
        },
        where: { is_active: IS_ACTIVE.ACTIVE, status: PRODUCT_PRICE_STATUS.AVAILABLE, agent_id: null },
      },
      {
        model: ProductAttribute,
        required: false,
        atrribute: ['name'],
        where: { is_active: IS_ACTIVE.ACTIVE },
        include: [
          { model: CategoryAttribute, required: false, where: { is_active: IS_ACTIVE.ACTIVE } },
          {
            model: AttributeOption,
            required: false,
            where: { is_active: IS_ACTIVE.ACTIVE },
          },
        ],
      },
      {
        model: ProductCustomAttribute,
        attributes: ['name', 'display_order'],
        include: {
          model: ProductCustomAttributeOption,
          where: { is_active: IS_ACTIVE.ACTIVE },
          attributes: ['name', 'id', 'product_custom_attribute_id'],
          required: false,
        },
      },
    ],
    // group: ['product.id'],
    logging: true,
  });
}

export async function checkExistProduct(id: number): Promise<any> {
  const product = await Product.findOne({
    where: { is_active: IS_ACTIVE.ACTIVE, id },
  });
  if (!product) {
    throw new AppError(apiCode.NOT_FOUND).with('Sản phẩm không tồn tại');
  }
}
