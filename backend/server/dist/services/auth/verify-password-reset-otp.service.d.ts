export interface VerifyPasswordResetOtpData {
    email: string;
    otp: string;
}
export declare const verifyPasswordResetOtp: ({ email, otp, }: VerifyPasswordResetOtpData) => Promise<{
    email: string;
    verified: boolean;
    message: string;
}>;
