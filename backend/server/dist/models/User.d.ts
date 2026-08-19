import { HydratedDocument, Model, Types } from "mongoose";
import { UserRole } from "../constants/roles.js";
export type AuthProvider = "local" | "google";
export interface IUser {
    _id: Types.ObjectId;
    name: {
        first: string;
        last: string;
    };
    email: string;
    phoneNumber?: string;
    password?: string;
    authProvider: AuthProvider;
    googleId?: string;
    role: UserRole;
    avatar: {
        url: string;
        publicId: string;
    };
    refreshToken?: string;
    isVerified: boolean;
    verifiedAt?: Date;
    verificationOtpHash?: string;
    verificationOtpExpiresAt?: Date;
    verificationOtpAttempts: number;
    isActive: boolean;
    deletedAt?: Date | null;
    lastLogin?: Date;
    loginCount: number;
}
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, {}, IUserMethods>;
declare const User: UserModel;
export default User;
