export interface ResetPasswordData {
    email: string;
    newPassword: string;
    confirmPassword: string;
}
export declare const resetPassword: ({ email, newPassword, confirmPassword, }: ResetPasswordData) => Promise<{
    email: string;
    message: string;
}>;
