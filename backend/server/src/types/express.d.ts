import { Types } from "mongoose";
import { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, "_id"> & {
        _id: Types.ObjectId;
      };
    }
  }
}

export {};