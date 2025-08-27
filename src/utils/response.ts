import { Request, Response, NextFunction, RequestHandler } from "express";
import httpStatus from "http-status";
import { Code, errorMessage } from "./error";
import logger from "./logger";
import moment from "moment-timezone";

export function respond<T>(handler: (req: Request, res: Response, next: NextFunction) => Promise<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

export const success = (res: Response, statusCode: number, data: unknown): void => {
  if (data == null) {
    res.status(statusCode).json({ success: true, statusCode });
  } else {
    res.status(statusCode).json({ success: true, statusCode, data });
  }
};

export const defaultError = (res: Response, msg?: any) => {
  logger.error(`${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}: ${msg?.message}`);
  let result = { result: false };
  const error_data = {
    status: msg?.status ?? 500,
    message: msg?.status ? msg?.message : errorMessage?.[Code.UNKNOWN_ERROR],
    debug_message: msg?.message,
  };
  if (msg) {
    const data = { data: error_data };
    result = Object.assign(result, data);
  }

  return res.status(msg?.status ? msg?.status : 500).json(result);
};

export const response = (res: Response, data?: object | null, code: any = httpStatus.OK) => {
  let result = { result: code === httpStatus.OK };

  if (typeof data === "object") {
    result = Object.assign(result, { data });
  }

  return res.status(code).json(result);
};

export const raiseError = (res: Response, statusCode: number, code: number, message: string): void => {
  res.status(statusCode).json({ success: false, statusCode, errors: { code, message } });
};
