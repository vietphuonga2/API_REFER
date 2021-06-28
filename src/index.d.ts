// import * as express from 'express';

import { Response, Request } from 'express-serve-static-core';

import { AuthorizedUser } from './commons/types';
declare global {
  namespace Express {
    // first, declare that we are adding a method to `Response` (the interface)
    interface Request {
      user?: { data: AuthorizedUser };
      getBaseServer(): string;
      getFullUrl(baseUrl?: string): string;
    }
  }
}
