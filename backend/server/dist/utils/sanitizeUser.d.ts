import { IUser } from "../models/User.js";
export declare const sanitizeUser: (user: IUser) => {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | undefined;
    role: import("../constants/roles.js").UserRole;
};
