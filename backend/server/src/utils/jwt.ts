import jwt, {
  type Secret,
  type SignOptions,
  type JwtPayload as JwtLibraryPayload,
} from "jsonwebtoken";

import { env } from "../config/env.js";
import { AUTH } from "../constants/auth.js";
import type { IUser } from "../models/User.js";

interface SlotGoJwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (user: IUser): string => {
  const payload: SlotGoJwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET as Secret,
    {
      expiresIn: AUTH.ACCESS_TOKEN.EXPIRES_IN,
    } as SignOptions,
  );
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: SlotGoJwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET as Secret,
    {
      expiresIn: AUTH.REFRESH_TOKEN.EXPIRES_IN,
    } as SignOptions,
  );
};

export const verifyAccessToken = (
  token: string,
): SlotGoJwtPayload & JwtLibraryPayload => {
  return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET as Secret,
  ) as SlotGoJwtPayload & JwtLibraryPayload;
};

export const verifyRefreshToken = (
  token: string,
): SlotGoJwtPayload & JwtLibraryPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET as Secret,
  ) as SlotGoJwtPayload & JwtLibraryPayload;
};
