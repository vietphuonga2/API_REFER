const _ = require('lodash');
import db from '../models';
import { IS_ACTIVE, apiCode, CONFIG } from '@commons/constant';

function isCallback(cb) {
  return typeof cb === 'function';
}

class ApplicationController {
  errors: any;
  model: string;
  constructor(m: string) {
    this.model = m;
  }

  async _create(data: Object = {}, options: Object = {}, callback = null) {
    return db[this.model].create(data, options).then((result) => {
      if (isCallback(callback)) return callback(result);

      return result;
    });
  }

  async _list(options: Object = {}, callback = null) {
    return db[this.model].findAll(options);
  }

  async _findAndCountAll(options: Object = {}, page: number, model: string = '') {
    const { count, rows } = await db[model || this.model].findAndCountAll(options);

    return {
      data: rows,
      paging: {
        page,
        totalItemCount: count instanceof Array ? count.length : count,
        limit: CONFIG.PAGING_LIMIT,
      },
    };
  }

  async _findOne(options: Object = {}, callback = null) {
    return db[this.model].findOne(options);
  }

  async _findOrCreateBy(options: Object = {}, callback = null) {}

  async _update(data: any = null, options: Object = {}, callback = null) {
    const check = await this._list(options);

    if (check.length === 0) throw apiCode.NOT_FOUND;

    return db[this.model].update(data, options).then((result) => {
      if (isCallback(callback)) return callback(result);
    });
  }
}

export default ApplicationController;
