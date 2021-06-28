import { UsersController } from "../controllers";
import { wrapHandlerWithJSONResponse } from "@commons/response";
const users = new UsersController();

export function initRoutes(app, router) {
  router
    .get("/", (req, res) =>
      res.status(200).send({ message: "Welcome to IMFO world" })
    )
    .put("/login", wrapHandlerWithJSONResponse(users.login));
  return router;
}
