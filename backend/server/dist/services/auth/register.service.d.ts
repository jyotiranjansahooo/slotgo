import { RegisterInput } from "../../validations/auth/register.validation.js";
export declare const registerService: (data: RegisterInput) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & Omit<import("../../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "comparePassword" | "id"> & import("mongoose").HydratedDocumentOverrides<import("../../models/User.js").IUserMethods & {
        id: string;
    }>;
    accessToken: string;
    refreshToken: string;
}>;
