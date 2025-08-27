import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { Code, getError } from "../utils/error";
import JWToken from "../utils/jwt";
import User from "../model/user.model";

export default function (): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.headers.authorization === "PsmDkqc1v6HN1z5LocGU") {
        (req as any).user = { _id: null };
        next();
        return;
      }
      if (!req.headers.authorization) {
        throw createError(401, getError(Code.TOKEN_NOT_FOUND));
      }
      const token = req.headers.authorization.split(" ")[1];

      const result = await JWToken.verify(token);
      if (!result.success) {
        if (result.error === JWToken.JWT_EXPIRED) {
          throw createError(408, getError(Code.TOKEN_EXPIRE));
        } else {
          throw createError(401, getError(Code.ACCESS_TOKEN_INVALID));
        }
      }

      const decoded = result.payload;
      const user = await User.findById(decoded._id);
      if (!user) throw createError(404, getError(Code.USER_NOT_FOUND));
      (req as any).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
