import { HydratedDocument, Model, Types } from "mongoose";
import { UserRole } from "../constants/roles.js";
export interface IUser {
    _id: Types.ObjectId;
    name: {
        first: string;
        last: string;
    };
    email: string;
    phoneNumber: string;
    password: string;
    role: UserRole;
    avatar: {
        url: string;
        publicId: string;
    };
    refreshToken?: string;
    isVerified: boolean;
    verifiedAt?: Date;
    isActive: boolean;
    deletedAt?: Date;
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
