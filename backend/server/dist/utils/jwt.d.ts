import { IUser } from "../models/User.js";
interface JwtPayload {
    userId: string;
    role: string;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const generateRefreshToken: (user: IUser) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
export {};
