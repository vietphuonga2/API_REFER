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
} from './models/BaseResponseModel';
import { handlePagingMiddleware, pagingMiddleware } from '@middleware/pagingMiddleware';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, GENDER, CONFIG, ONESIGNAL } from '@commons/constant';
import { ApplicationController } from './';
import { category, atrribute, atrributeDetail } from './mock/category';
import Joi from '../helpers/validationHelper';
import { required } from 'joi';
import { enterprises } from './mock/enterprises';

const db = require('@models');
const axios = require('axios');
const https = require('https');
const {
  Role,
  DFProvince,
  sequelize,
  Sequelize,
  User,
  Category,
  CategoryAttribute,
  AttributeOption,
  Level,
  Notification,
  DFNotificationType,
} = db.default;
const { Op } = Sequelize;

interface AttributeRequestModels {
  name: string;
  type: number;
  display_order: number;
  attribute_option: any;
  // value: string;
  // product_id: number;
  // category_attribute_option_id: number;
}

const notificationService = {};

/**
 * Danh mục sản phẩm
 */
@Route('notification')
@Tags('notification')
export class notificationController extends ApplicationController {
  constructor() {
    super('Notification');
  }

  // dánh sách noti
  @Security('jwt')
  @Get('/')
  public async getListNotification(@Request() request: any): Promise<SuccessResponseModel<any>> {
    // return withSuccess(request.user.data);
    const { id } = request.user.data;
    const noti = await Notification.findAll({ where: { is_active: IS_ACTIVE.ACTIVE, enterprise_id: id } });
    return withSuccess(noti);
  }

  // dánh sách các loại noti
  @Security('jwt')
  @Get('/noti-type')
  public async getListTypeNotification(@Request() request: any): Promise<SuccessResponseModel<any>> {
    // return withSuccess(request.user.data);
    const { id } = request.user.data;
    const noti = await DFNotificationType.findAll({ where: { is_active: IS_ACTIVE.ACTIVE } });
    return withSuccess(noti);
  }

  public async createNotification({ title, content, user_id, is_read = 0, df_notification_type_id }, transaction) {
    const notiType = await DFNotificationType.findOne({
      where: { is_active: IS_ACTIVE.ACTIVE, value: df_notification_type_id },
    });

    if (!notiType) throw apiCode.NOT_FOUND;

    return Notification.create(
      {
        df_notification_type_id,
        title: title || notiType.title,
        content,
        user_id,
        is_read,
      },
      { transaction },
    );
  }

  public async pushNotification() {
    const notifications = await Notification.findAll({
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        user_id: 167,
      },
      attributes: { include: [[sequelize.col('user.device_id'), 'device_id']] },
      include: [
        {
          model: User,
          where: {
            is_active: IS_ACTIVE.ACTIVE,
            [Op.and]: [{ device_id: { [Op.ne]: null } }, { device_id: { [Op.ne]: '' } }],
          },
          attributes: [],
        },
        // {
        //   model: DFNotificationType,
        //   include: [
        //     {
        //       model: NotificationConfig,
        //       where: {
        //         is_active: IS_ACTIVE.ACTIVE,
        //         customer_id: sequelize.where(
        //           Sequelize.literal('`noti_type->notification_configs`.`customer_id`'),
        //           Sequelize.literal('`notification`.`customer_id`')
        //         ),
        //       },
        //       attributes: [],
        //     },
        //   ],
        //   // attributes: [],
        // },
      ],
      limit: 10,
    });
    console.log(notifications.dataValues);

    notifications.forEach((notification) => {
      const message = {
        app_id: ONESIGNAL.APP_ID,
        data: notification.dataValues,
        headings: { en: notification.title },
        contents: { en: notification.content },
        android_channel_id: ONESIGNAL.ANDROID_CHANNEL_ID,
        include_player_ids: [notification.dataValues.device_id],
        // include_player_ids: ['bd80cab6-084c-4671-aa22-ad0cc31287d0'],
      };

      this.sendNotification(message)

      console.log(message);

      // await Notification.update({ last_pushed_time: Date.now() }, { where: { id } });
    });

    return notifications;
  }

  public async onesignal(notification) {
    axios.defaults.baseURL = 'https://onesignal.com/api';
    axios.defaults.headers.common.Authorization = `Basic :${ONESIGNAL.AUTHORIZATION}`;
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    axios
      .post('/v1/notifications', {
        app_id: ONESIGNAL.APP_ID,
        data: notification.data,
        headings: { en: notification.title },
        contents: { en: notification.content },
        android_channel_id: ONESIGNAL.ANDROID_CHANNEL_ID,
        include_player_ids: [notification.device_id],
        // include_player_ids: ['bd80cab6-084c-4671-aa22-ad0cc31287d0'],
      })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  public async sendNotification(data) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${ONESIGNAL.AUTHORIZATION}`,
    };

    const options = {
      host: 'onesignal.com',
      port: 443,
      path: '/api/v1/notifications',
      method: 'POST',
      headers,
    };

    const req = https.request(options, (res) => {
      res.on('data', async (result) => {
        console.log(JSON.stringify(result));
        // await onSuccess();
      });
    });

    req.on('error', async (err) => {
      console.log(err);
      // await onError();
    });

    req.write(JSON.stringify(data));
    req.end();
  }
}
