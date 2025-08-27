import express, { Router } from "express";
import { respond } from "../utils/response";
import authCheck from "../middleware/jwt.middlewares";
import { recommend } from "../controller/google.controller";

export default function googleRoute(): Router {
  const auth = authCheck();
  const router = express.Router({ mergeParams: true });

  router.post("/recommend", respond(recommend));

  return router;
}
