import { DFProvinceController } from '../controllers';
import { verifyJWT_MW } from '../config/middlewares';
import * as express from 'express';
import { wrapHandlerWithJSONResponse } from '@commons/response';
import { pagingMiddleware } from '@middleware/pagingMiddleware';
const apiRoute = express.Router();

const province = new DFProvinceController();

apiRoute.get('/', wrapHandlerWithJSONResponse(province.getListDFProvince));

export default apiRoute;
