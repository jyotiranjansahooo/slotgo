export interface ResendOtpData {
    email: string;
}
export declare const resendOtpService: (data: ResendOtpData) => Promise<{
    email: string;
    message: string;
}>;
