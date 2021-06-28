import { CONFIG } from '@commons/constant';

const PAGING_LIMIT_MAX = 1000;

export function pagingMiddleware(req, res, next) {
  req.query.isPaging = +req.query.page > 0;
  let { page = 1, limit = CONFIG.PAGING_LIMIT } = req.query;
  if (limit <= 0 || limit > PAGING_LIMIT_MAX) {
    limit = CONFIG.PAGING_LIMIT;
  }
  page = Math.max(page, 1);

  const offset = (page - 1) * limit;
  req.query.page = page;
  req.query.limit = +limit;
  req.query.offset = offset;

  next();
}

export function handlePagingMiddleware(req): { page: number; limit: number; offset: number } {
  req.query.isPaging = +req.query.page > 0;

  let page = +req.query.page || 1;
  let limit = +req.query.limit || CONFIG.PAGING_LIMIT;
  if (limit <= 0 || limit > PAGING_LIMIT_MAX) {
    limit = CONFIG.PAGING_LIMIT;
  }
  page = Math.max(page, 1);

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
