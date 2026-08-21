type UserRole = "driver" | "parkingOwner";
interface GoogleLoginData {
    credential: string;
    role?: UserRole;
}
export declare const googleLoginService: ({ credential, role, }: GoogleLoginData) => Promise<{
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
export {};
