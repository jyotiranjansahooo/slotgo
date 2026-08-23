declare class PaymentService {
    createPayment(userId: string, bookingId: string): Promise<{
        booking: any;
        payment: any;
        razorpayOrder: {
            id: any;
            amount: number;
            currency: any;
        };
    } | {
        booking: any;
        payment: any;
        razorpayOrder: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder;
    }>;
    verifyPayment(userId: string, orderId: string, paymentId: string, signature: string): Promise<{
        payment: any;
        booking: any;
        wallet: any;
        transaction: any;
    }>;
    createOvertimePayment(userId: string, bookingId: string): Promise<{
        booking: any;
        razorpayOrder: {
            id: any;
            amount: number;
            currency: string;
        };
    } | {
        booking: any;
        razorpayOrder: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder;
    }>;
    verifyOvertimePayment(userId: string, orderId: string, paymentId: string, signature: string): Promise<{
        booking: any;
        payment: {
            orderId: string;
            paymentId: any;
            signature?: undefined;
        };
        overtime: {
            overtimeMinutes: any;
            overtimeParkingAmount: any;
            overtimeFine: any;
            overtimeTotal: any;
        };
        wallet?: undefined;
        transaction?: undefined;
    } | {
        booking: any;
        payment: {
            orderId: string;
            paymentId: string;
            signature: string;
        };
        overtime: {
            overtimeMinutes: any;
            overtimeParkingAmount: any;
            overtimeFine: any;
            overtimeTotal: any;
        };
        wallet: {} | null;
        transaction: {} | null;
    }>;
    refundPayment(userId: string, paymentId: string, amount?: number): Promise<{
        payment: any;
        refund: import("razorpay/dist/types/refunds.js").Refunds.RazorpayRefund;
        wallet: {} | null;
        transaction: {} | null;
    }>;
}
declare const _default: PaymentService;
export default _default;
