export interface VerifyOtpData {
    email: string;
    otp: string;
}
export declare const verifyOtpService: ({ email, otp }: VerifyOtpData) => Promise<{
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | undefined;
        role: import("../../constants/roles.js").UserRole;
        avatar: {
            url: string;
            publicId: string;
        };
        isVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
}>;
