import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../model/user.model";
import JWToken from "../utils/jwt";
import { response, defaultError } from "../utils/response";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { IUser as IUserType } from "../@types/user";

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message).join(", ");
      return response(res, { message: errors }, 400);
    }
    const { email, password } = value as { email: string; password: string };
    const existed = await User.findOne({ email }).lean();
    if (existed) {
      return response(res, { message: "Email already exists" }, 400);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await User.create({
      email,
      password: passwordHash,
      displayName: "",
      firebaseId: "",
      fullname: "",
      kycSessionId: "",
      kycStatus: "",
      kycedAt: null,
      kycedStatusId: "",
      phoneUrl: "",
      referralCode: "",
      referredBy: "",
      status: "",
      totalTopup: null,
      totalTopupUsd: null,
      totalTransaction: null,
      userId: "",
      uid: "",
      usd: [],
      verifiedAt: null,
      wallets: { bin: null, bsc: null, eth: null },
      createdAt: null,
    });
    const createdObj = (await User.findById(created._id).lean()) as unknown as IUserType & {
      email?: string;
      displayName?: string;
    };
    const issued = await JWToken.sign({ _id: createdObj._id, email: createdObj.email });
    return response(res, {
      access_token: issued.token,
      user: {
        _id: createdObj._id,
        email: createdObj.email,
        displayName: createdObj.displayName,
        avatar: createdObj.avatar,
        created: createdObj.created,
      },
    });
  } catch (e) {
    return defaultError(res, e);
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message).join(", ");
      return response(res, { message: errors }, 400);
    }
    const { email, password } = value as { email: string; password: string };
    const user = (await User.findOne({ email }).lean()) as unknown as IUserType & {
      password?: string;
      email?: string;
      displayName?: string;
    };
    if (!user || !user.password) {
      return response(res, { message: "Invalid email or password" }, 400);
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return response(res, { message: "Invalid email or password" }, 400);
    }
    const issued = await JWToken.sign({ _id: user._id });
    return response(res, {
      access_token: issued.token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        created: user.created,
      },
    });
  } catch (e) {
    return defaultError(res, e);
  }
};
