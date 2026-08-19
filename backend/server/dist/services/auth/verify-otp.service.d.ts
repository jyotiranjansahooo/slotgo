export interface VerifyOtpData {
    email: string;
    otp: string;
}
export declare const verifyOtpService: (data: VerifyOtpData) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | undefined;
        role: import("../../constants/roles.js").UserRole;
    };
    accessToken: string;
    refreshToken: string;
}>;
