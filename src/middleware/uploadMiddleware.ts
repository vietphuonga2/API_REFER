import * as mime from 'mime-types';
import * as multer from 'multer';
import * as path from 'path';
const { v4: uuidv4 } = require('uuid');
import * as express from 'express';
import { apiCode, IS_ACTIVE, PRODUCT_ORDER_TYPE, PRODUCT_MEDIA_TYPE, AppError } from '@commons/constant';

const storage = multer.diskStorage({
  destination: (req: any, file, callback) => {
    callback(null, path.join('uploads', req.asset_type == PRODUCT_MEDIA_TYPE.VIDEO ? 'video' : 'image'));
  },
  filename: (req, file, cb) => {
    const id = uuidv4().replace(/-/g, '');
    cb(null, `${file.fieldname}_${id}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (req.asset_type == PRODUCT_MEDIA_TYPE.VIDEO) {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Image uploaded is not of type jpg/jpeg or png'), false);
    }
  } else if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Image uploaded is not of type jpg/jpeg or png'), false);
  }
};

// const storage = multer.memoryStorage();
const imageUploader = multer({ storage, fileFilter });

export async function handleSingleFile(request: any, name: string, mediaType: number): Promise<any> {
  request.asset_type = mediaType;
  const multerSingle = imageUploader.single(name);
  return new Promise((resolve, reject) => {
    multerSingle(request, undefined, async (error) => {
      if (error) {
        reject(error);
      }
      resolve({});
    });
  });
}
