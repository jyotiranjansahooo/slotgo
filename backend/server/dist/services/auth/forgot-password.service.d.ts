export interface ForgotPasswordData {
    email: string;
}
export declare const forgotPassword: ({ email, }: ForgotPasswordData) => Promise<{
    email: string;
    message: string;
}>;
