import { Get, Route, Security, Response, Request, Post, Tags, Body } from 'tsoa';
import * as express from 'express';
import * as multer from 'multer';
import * as uploadMiddleware from '@middleware/uploadMiddleware';
import { withSuccess } from './models/BaseResponseModel';
import { apiCode, IS_ACTIVE, PRODUCT_ORDER_TYPE, PRODUCT_MEDIA_TYPE, AppError } from '@commons/constant';

const getBaseUrl = (req: any) => `${req.protocol}://${req.headers.host}`;

interface MulterRequest extends express.Request {
  file: any;
}

@Route('files')
@Tags('files')
export class FilesController {
  @Post('uploadImage/{type}')
  public async uploadImage(@Request() request: express.Request, type: 1 | 2): Promise<any> {
    const baseurl = getBaseUrl(request);
    if (type == PRODUCT_MEDIA_TYPE.IMAGE) {
      await uploadMiddleware.handleSingleFile(request, 'image', type);
    } else if (type == PRODUCT_MEDIA_TYPE.VIDEO) {
      await uploadMiddleware.handleSingleFile(request, 'video', type);
    } else {
      throw new AppError(apiCode.INVALID_PARAM).with('Kiểu resource không hợp lệ');
    }
    // await uploadMiddleware.handleSingleFile(request, 'image', PRODUCT_MEDIA_TYPE.IMAGE);
    // file will be in request.randomFileIsHere, it is a buffer
    const { file } = request as MulterRequest;
    if (!file) {
      throw new AppError(apiCode.UPLOAD_FAILED);
    }
    const { filename, fieldname, destination, path } = file;
    const url = `${baseurl}/${path}`;
    return withSuccess({ filename: filename, url: url, path });
  }
}
