import { GENDER, IS_ACTIVE } from '@commons/constant';
import Joi from '../../helpers/validationHelper';
export interface AgentGeneralRequestModel {
    province_id?: number;
    id_number: any;
    wallet_id?: number;
    referal_agent_id?: number;
}

export const BasicUserSchema = Joi.object({
    name: Joi.string().required().label('Tên'),
    phone: Joi.string().required().label('Số điện thoại'),
    email: Joi.string().allow('', null),
    df_type_user_id: Joi.number().empty(['', null]).required(),
    gender: Joi.number()
        .empty(['', null, 0, '0'])
        .valid(...Object.values(GENDER)),
    date_of_birth: Joi.date(),
    address: Joi.string().allow('', null, 'null', ""),
    id_number: Joi.string().allow('', null, 'null', ""),
    province_id: Joi.number().empty(['', null, 0, '0']),
});
export const PasswordSchema = Joi.object({
    password: Joi.string().trim().required(),
});
export const DateJoi = Joi.object({
    Date: Joi.date(),
});
