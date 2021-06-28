import { verifyJWTToken } from './auth';
import { wrapErrorJSON } from '@commons/response';

import { IS_ACTIVE, apiCode, USER_STATUS } from '@commons/constant';

import db from '../models/';
const Sequelize = db['Sequelize'];
const { Op } = Sequelize;

export function verifyJWT_MW(req, res, next) {
  // console.log("Headers: " + JSON.stringify(req.headers, null, 2));
  if (req.headers && req.headers['token']) {
    verifyJWTToken(req.headers['token'])
      .then(({ data }) => {
        db['User']
          .findOne({
            raw: true,
            where: {
              // token: req.headers["token"],
              token: { [Op.ne]: null },
              phone_number: data['phone_number'],
              id: data['id'],
            },
          })
          .then(function (user) {
            if (!user) return res.json(wrapErrorJSON(apiCode.UNAUTHORIZED));
            if (!user.agent_id) user.agent_id = user.id;
            req.user = user;
            next();
          })
          .catch(function (err) {
            req.user = undefined;
            return res.json(wrapErrorJSON(apiCode.UNAUTHORIZED));
          });
      })
      .catch((err) => {
        return res.json(wrapErrorJSON(apiCode.INVALID_ACCESS_TOKEN));
      });
  } else {
    req.user = undefined;
    return res.json(wrapErrorJSON(apiCode.UNAUTHORIZED));
  }
}
