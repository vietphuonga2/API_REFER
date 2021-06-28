import Joi from '../../helpers/validationHelper';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG, PRODUCT_ORDER_TYPE } from '@commons/constant';

export interface ProductGeneralRequestModel {
  name: string;
  is_public: number;
  order_type: number;
  category_id: number;
  description: string;
  // enterprise_id?: number;
}
export interface ProductGeneralRequestModelCode {
  code: string;
}
export interface ProductGeneralRequestModelStatus {
  status: number;
}

export interface AttributeItem {
  attribute_id: number;
  value?: string;
  attribute_option_id?: number;
}

export interface ProductAttributeRequestModel {
  attributes: AttributeItem[];
}

export const ProductGeneralRequestSchema = Joi.object({
  name: Joi.string().required().label('Tên'),
  is_public: Joi.number().valid(0, 1).required(),
  order_type: Joi.number()
    .valid(...Object.values(PRODUCT_ORDER_TYPE))
    .required(),
  category_id: Joi.number().empty(['null', 'undefined']).required(),
  // enterprise_id: Joi.number().empty(['null', 'undefined']).required(),
  description: Joi.string(),
});
export const ProductCodeSchema = Joi.object({
  code: Joi.string().required().label('Mã sản phẩm'),
});
export const ProductStatus = Joi.object({
  status: Joi.number().required(),
});
export const AttributeRequestSchema = Joi.object({
  attributes: Joi.array().items(
    Joi.object({
      attribute_id: Joi.number().required(),
      value: Joi.string().empty(['', 'null', null]),
      attribute_option_id: Joi.number().empty([null, 0]),
    }).xor('value', 'attribute_option_id'),
  ),
});
