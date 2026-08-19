export declare const generateOtp: () => string;
export declare const hashOtp: (otp: string) => string;
export declare const getOtpExpiry: () => Date;
export declare const verifyOtp: (otp: string, hashedOtp: string) => boolean;
export declare const getOtpExpiryMinutes: () => number;
export declare const getMaxOtpAttempts: () => number;
