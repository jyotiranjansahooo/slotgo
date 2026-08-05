import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "../constants/auth.js";
import { IUser } from "../models/user.js";

interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: AUTH.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};