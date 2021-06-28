import * as express from 'express';
export function getBaseServer(request: express.Request): string {
  return `${request.protocol}://${request.headers.host}`;
}

export function getFullUrl(request: express.Request, path?: string): string {
  if (!path) {
    return null;
  }
  const correctPath = path.replace(/^\//g, '');
  return `${request.protocol}://${request.headers.host}/${correctPath}`;
}
