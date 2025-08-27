import util from "util";

export enum Code {
  // PUBLIC - 0
  PARAMETER_INVALID = 1001,
  PERMISSION_DENIED = 1011,
  FORBIDDEN = 1012,
  UNKNOWN_ERROR = 99999,
  // AUTH - 1
  TOKEN_NOT_FOUND = 1101,
  TOKEN_EXPIRE = 1102,
  ACCESS_TOKEN_INVALID = 1111,
  ACCESS_TOKEN_EXPIRE = 1112,
  REFRESH_TOKEN_EXPIRE = 1113,
  REFRESH_TOKEN_INVALID = 1114,
  // USER - 2
  USER_NOT_FOUND = 1201,
}

export const errorMessage: { [key in Code]: string } = {
  // PUBLIC - 0
  [Code.PARAMETER_INVALID]: "Parameter invalid: %s",
  [Code.FORBIDDEN]: "Forbidden!",
  [Code.UNKNOWN_ERROR]: "Something went wrong, please try again later!",
  [Code.PERMISSION_DENIED]: "Permission denied",
  // AUTH - 1
  [Code.TOKEN_NOT_FOUND]: "Access token not found",
  [Code.TOKEN_EXPIRE]: "Access token expire",
  [Code.ACCESS_TOKEN_INVALID]: "Access token invalid",
  [Code.ACCESS_TOKEN_EXPIRE]: "Access token is expire",
  [Code.REFRESH_TOKEN_EXPIRE]: "Refresh token expired",
  [Code.REFRESH_TOKEN_INVALID]: "Refresh token invalid",
  // USER - 2
  [Code.USER_NOT_FOUND]: "User not found",
};

export class ErrorEx extends Error {
  constructor(readonly code: Code, readonly message: string) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export function getError(code: Code, ...args: unknown[]): ErrorEx {
  const message = util.format(errorMessage[code], ...args);
  return new ErrorEx(code, message);
}
