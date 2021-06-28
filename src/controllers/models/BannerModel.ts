import { GENDER, IS_ACTIVE, BANNER_TYPE } from '@commons/constant';
import Joi from '../../helpers/validationHelper';
export interface BannerRequestModel {
  title?: string;
  description?: string;
  gift_hunting_status?: number;
  gift_code?: string;
  time_hunting?: string;
  product_id?: number;
  type?: number;
  media_url?: string;
}

export const BasicBannerSchema = Joi.object({
  title: Joi.string().required().label('Tiêu đề'),
  media_url: Joi.string().required().label('Ảnh banner '),
  description: Joi.string().required().label('Mô tả'),
  gift_hunting_status: Joi.number().empty(['', null]).required(),
  gift_code: Joi.string().allow('', null, 'null', ''),
  time_hunting: Joi.date().allow('', null, 'null', ''),
  product_id: Joi.number().allow('', null, 0, '0'),
  type: Joi.number()
    .empty(['', null, 0, '0'])
    .valid(...Object.values(BANNER_TYPE)),
});
