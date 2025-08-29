import express, { Router } from "express";
import { respond } from "../utils/response";
import { recommend, placeInfo, placeView } from "../controller/google.controller";

export default function googleRoute(): Router {
  const router = express.Router({ mergeParams: true });

  router.post("/recommend", respond(recommend));
  router.get("/place-info/:id", respond(placeInfo));
  router.post("/place-view", respond(placeView));

  return router;
}
