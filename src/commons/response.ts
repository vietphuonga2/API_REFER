// const { ValidationError } = require('joi');
const _ = require('lodash');
import { CONFIG } from '@commons/constant';
import * as handleRequestMiddleware from '../middleware/handleRequestMiddleware';

export function wrapErrorJSON(error, message = null, ex = '') {
  return {
    status: 0,
    code: error.code,
    msg: message || error.message,
    ex: ex || ex,
    data: {},
  };
}

export function wrapHandlerWithJSONResponse(handler) {
  return async function (req, res, next) {
    try {
      handleRequestMiddleware.all(req, res, next);
      let result = await handler(req, res);
      if (!_.isObject(result) || !result.data) {
        result = { data: result };
      }
      res.json({
        status: 1,
        code: 1,
        msg: 'Thành công',
        ...result,
      });
    } catch (error) {
      console.error(error);
      res.json(wrapErrorJSON(error));
    }
  };
}
