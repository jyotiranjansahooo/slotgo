export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    role: "driver" | "parkingOwner";
}
export declare const registerService: (data: RegisterData) => Promise<{
    requiresVerification: boolean;
    email: string;
    message: string;
}>;
