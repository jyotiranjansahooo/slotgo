import { IUser } from "../models/User.js";
export interface CreateUserData {
    name: {
        first: string;
        last: string;
    };
    email: string;
    phoneNumber: string;
    password: string;
    role: IUser["role"];
}
declare class UserRepository {
    create(userData: CreateUserData): Promise<import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    findByPhone(phoneNumber: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    emailExists(email: string): Promise<boolean>;
    phoneExists(phoneNumber: string): Promise<boolean>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    updateLastLogin(userId: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>)[]>;
    findByIdForAdmin(id: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
    updateStatus(id: string, isActive: boolean): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../models/User.js").IUserMethods & {
        id: string;
    }>) | null>;
}
declare const _default: UserRepository;
export default _default;
