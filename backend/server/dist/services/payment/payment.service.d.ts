declare class PaymentService {
    createPayment(bookingId: string): Promise<{
        booking: any;
        payment: any;
        razorpayOrder: {
            id: any;
            amount: any;
            currency: any;
        };
    } | {
        booking: any;
        payment: any;
        razorpayOrder: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder;
    }>;
    verifyPayment(orderId: string, paymentId: string, signature: string): Promise<{
        payment: any;
        booking: any;
    }>;
    refundPayment(paymentId: string, amount?: number): Promise<{
        payment: any;
        refund: import("razorpay/dist/types/refunds.js").Refunds.RazorpayRefund;
    }>;
}
declare const _default: PaymentService;
export default _default;
