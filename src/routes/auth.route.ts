import express, { Router } from "express";
import { login, register } from "../controller/auth.controller";
import { respond } from "../utils/response";

export default function authRoute(): Router {
  const router = express.Router({ mergeParams: true });
  router.post("/register", respond(register));
  router.post("/login", respond(login));

  return router;
}
