import mongoose, { Schema, Document } from "mongoose";

interface ISubBalance {
  availableBalance: number;
  currency: string;
  customer: string;
  frozen: boolean;
  id: string;
  updated: string;
}

interface IBalance {
  accountCurrency: string;
  active: boolean;
  balance: ISubBalance;
}

interface IUser extends Document {
  balance: number;
  createdAt?: Date;
  displayName?: string;
  email: string;
  password: string;
  firebaseId?: string;
  fullname?: string;
  kycSessionId?: string;
  kycStatus?: string;
  kycedAt?: Date;
  kycedStatusId?: string;
  phoneUrl?: string;
  referralCode?: string;
  referredBy?: string;
  status?: string;
  totalTopup?: number;
  totalTopupUsd?: number;
  totalTransaction?: number;
  userId?: string;
  uid?: string;
  usd?: IBalance[];
  verifiedAt?: Date;
  wallets: {
    bin: unknown;
    bsc: unknown;
    eth: unknown;
  };
}

const userSchema = new Schema<IUser>({
  balance: { type: Number, default: 0 },
  createdAt: { type: Date },
  displayName: { type: String },
  email: { type: String },
  password: { type: String },
  fullname: { type: String },
  kycSessionId: { type: String },
  kycStatus: { type: String },
  kycedAt: { type: Date },
  kycedStatusId: { type: String },
  phoneUrl: { type: String },
  referralCode: { type: String },
  referredBy: { type: String },
  status: { type: String },
  totalTopup: { type: Number },
  totalTopupUsd: { type: Number },
  totalTransaction: { type: Number },
  userId: { type: String },
  firebaseId: { type: String },
  uid: { type: String },
  usd: {
    type: [
      {
        accountCurrency: { type: String },
        active: { type: Boolean },
        balance: {
          availableBalance: { type: Number, default: 0 },
          currency: { type: String },
          customer: { type: String },
          frozen: { type: Boolean },
          id: { type: String },
          updated: { type: String },
        },
      },
    ],
  },
  verifiedAt: { type: Date },
  wallets: {
    bin: { type: Schema.Types.Mixed },
    bsc: { type: Schema.Types.Mixed },
    eth: { type: Schema.Types.Mixed },
  },
});

const User = mongoose.model<IUser>("User", userSchema, "user");

export default User;
