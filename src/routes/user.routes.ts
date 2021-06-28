import { UsersController } from '../controllers';
import { verifyJWT_MW } from '../config/middlewares';
import * as express from 'express';
import { wrapHandlerWithJSONResponse } from '@commons/response';
import { pagingMiddleware } from '@middleware/pagingMiddleware';
const apiRoute = express.Router();

const users = new UsersController();

// apiRoute.get(
//   '/canlogin',
//   wrapHandlerWithJSONResponse(async (req, res) => {
//     users.myLogin();
//   })
// );
// .put('/logout', verifyJWT_MW, wrapHandlerWithJSONResponse(users.logout))
// .post('/', verifyJWT_MW, wrapHandlerWithJSONResponse(users.create))
// .put('/', verifyJWT_MW, wrapHandlerWithJSONResponse(users.update))
// .delete('/', verifyJWT_MW, wrapHandlerWithJSONResponse(users.delete))
// .get('/', verifyJWT_MW, pagingMiddleware, wrapHandlerWithJSONResponse(users.getListUser))
// .get('/info', verifyJWT_MW, wrapHandlerWithJSONResponse(users.getUserInfo))
// .put('/reset-password', verifyJWT_MW, wrapHandlerWithJSONResponse(users.resetPassword))
// .get('/:id', verifyJWT_MW, wrapHandlerWithJSONResponse(users.getUserDetail));

export default apiRoute;
