export interface RegisterRequestData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: "driver" | "parkingOwner";
}
export declare const registerRequestOtp: (data: RegisterRequestData) => Promise<{
    email: string;
    message: string;
}>;
