import { type JwtPayload as JwtLibraryPayload } from "jsonwebtoken";
import type { IUser } from "../models/User.js";
interface SlotGoJwtPayload {
    userId: string;
    role: string;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const generateRefreshToken: (user: IUser) => string;
export declare const verifyAccessToken: (token: string) => SlotGoJwtPayload & JwtLibraryPayload;
export declare const verifyRefreshToken: (token: string) => SlotGoJwtPayload & JwtLibraryPayload;
export {};
