declare class RazorpayService {
    createOrder(amount: number, receipt: string): Promise<import("razorpay/dist/types/orders.js").Orders.RazorpayOrder>;
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
    refundPayment(paymentId: string, amount?: number): Promise<import("razorpay/dist/types/refunds.js").Refunds.RazorpayRefund>;
}
declare const _default: RazorpayService;
export default _default;
