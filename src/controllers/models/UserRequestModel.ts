import Joi from '../../helpers/validationHelper';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG, USER_TYPE } from '@commons/constant';

export interface UserRequestModel {
  email: string;
  name: string;
  df_type_user_id: number;
  phone: string;
  gender?: number;
  date_of_birth?: string;
  address?: string;
  province_id?: number;
}

export interface AgentUserRegisterModel {
  email: string;
  name: string;
  df_type_user_id: number;
  phone: string;
  enterprise_code?: string;
  referal_id?: string;
}

export interface UserWithPasswordModel extends UserRequestModel {
  password: string;
}

export const BasicUserSchema = Joi.object({
  name: Joi.string().required().label('Tên'),
  phone: Joi.string().required().label('Số điện thoại'),
  email: Joi.string().allow('', null),
});

export const UserRequestSchema = BasicUserSchema.keys({
  gender: Joi.number()
    .empty(['', null, 0, '0'])
    .valid(...Object.values(GENDER)),
  date_of_birth: Joi.date(),
  address: Joi.string().allow('', null),
  province_id: Joi.number().empty(['', null, 0, '0']),
});

export const NotUserTypeSchema = Joi.object({
  df_type_user_id: Joi.number()
    .empty(['', null])
    .invalid(...Object.values(USER_TYPE))
    .required(),
});

export const PasswordSchema = Joi.object({
  password: Joi.string().trim().required(),
});

export const AgentReferalSchema = Joi.object({ referal_id: Joi.string().empty(['', null, 0, 'null']) });
