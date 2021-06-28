import { apiCode } from '@commons/constant';

export interface AppError extends Error {
  message: string;
  code?: number;
}
export interface ErrorResponseModel {
  status: number;
  code: number | string;
  message?: string;
  // error: any;
  errors?: any;
  debug?: any;
}

export interface PagingModel {
  page: number;
  totalItemCount: number;
  limit: number;
}

export interface SuccessResponseModel<T> {
  status: number;
  code: number;
  message?: string;

  data: T;
}

export interface PagingResponseModel<T> extends SuccessResponseModel<T> {
  paging?: PagingModel;
}

export function withError(error: any, errors?: any): ErrorResponseModel {
  return {
    status: 0,
    code: error.code || apiCode.DB_ERROR.code,
    message: error.message || apiCode.DB_ERROR.message,
    debug: process.env.NODE_ENV === 'development' ? error : undefined,
    // error: error,
    errors,
  };
}
export function withSuccess<T>(data: T): SuccessResponseModel<T> {
  return {
    status: 1,
    code: 1,
    message: 'Thành công',
    data,
  };
}

export function withPagingSuccess<T>(data: T, paging?: PagingModel): PagingResponseModel<T> {
  return {
    status: 1,
    code: 1,
    message: 'Thành công',
    data,
    paging,
  };
}
