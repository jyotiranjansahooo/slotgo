import { Types } from "mongoose";
import { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        _id: Types.ObjectId;
      };
    }
  }
}

export {};