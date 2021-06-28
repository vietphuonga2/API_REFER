import { trimStringProperties } from "../helpers/trimStringProperties";

// trimRequest middleware: trim all request object: body, params, query
const all = function (req, res, next) {
  if (req.body) {
    trimStringProperties(req.body);
  }

  if (req.params) {
    trimStringProperties(req.params);
  }

  if (req.query) {
    trimStringProperties(req.query);
  }

  //   next();
};

// trimBody middleware: trim only the body object
const body = function (req, res, next) {
  if (req.body) {
    trimStringProperties(req.body);
  }
  next();
};

const param = function (req, res, next) {
  if (req.params) {
    trimStringProperties(req.params);
  }
  next();
};

const query = function (req, res, next) {
  if (req.query) {
    trimStringProperties(req.query);
  }
  next();
};

export { all, body, param, query };
