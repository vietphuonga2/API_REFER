import * as express from 'express';
import { verify } from 'jsonwebtoken';
import { IS_ACTIVE, apiCode, USER_STATUS, ROLE, AppError } from '@commons/constant';
import { verifyJWTToken } from '@config/auth';
const db = require('@models');
const { DFProvince, sequelize, Sequelize, User } = db.default;
import { AuthorizedUser } from '@commons/types';

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'token') {
    const token = request.headers.token;
    if (token === '123') {
      return Promise.resolve({
        id: 1,
        name: 'Ironman',
      });
    } else {
      return Promise.reject(new Error('Không có quyền'));
    }
  }
  if (securityName === 'jwt') {
    const token = request.headers['token'];
    if (!token) {
      return Promise.reject(apiCode.INVALID_ACCESS_TOKEN);
    }

    return verifyJWTToken(token).then((decodedToken: any) => {
      console.log('authorized', decodedToken, scopes);
      const foundRole = Object.keys(ROLE).find((k) => ROLE[k] == decodedToken?.data?.df_type_user_id);

      if (scopes && scopes.length > 0) {
        if (foundRole && scopes.includes(foundRole.toLowerCase())) {
          return decodedToken;
        }
        throw new AppError(apiCode.UNAUTHORIZED);
      }
      return decodedToken;
    });
    // .catch((err) => {
    //   return Promise.reject(apiCode.INVALID_ACCESS_TOKEN);
    // });

    // return new Promise((resolve, reject) => {
    //   if (!token) {
    //     reject(apiCode.INVALID_ACCESS_TOKEN);
    //   }
    //   // verify(token, secret, (err: any, decoded: any) => {
    //   //   if (err) {
    //   //     reject(err);
    //   //   } else {
    //   //     // if (scopes) {
    //   //     //   // Check if JWT contains all required scopes
    //   //     //   for (const scope of scopes) {
    //   //     //     if (!decoded.scopes.includes(scope)) {
    //   //     //       reject(new Error('JWT does not contain required scope.'));
    //   //     //     }
    //   //     //   }
    //   //     //   resolve(decoded);
    //   //     // }

    //   //     resolve(decoded);
    //   //   }
    //   // });
    // });
  }
  return Promise.reject({});
}
