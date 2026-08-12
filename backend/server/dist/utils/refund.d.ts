interface RefundInput {
    parkingAmount: number;
    bookingHours: number;
    bookedDays: number;
    hoursBeforeStart: number;
}
export interface RefundResult {
    refundAmount: number;
    penaltyAmount: number;
    refundPlatformFee: boolean;
}
export declare const calculateRefund: ({ parkingAmount, bookingHours, bookedDays, hoursBeforeStart, }: RefundInput) => RefundResult;
export {};
