import { CreateBookingCheckoutInput } from "../../validations/booking/checkout.validation.js";
declare class BookingCheckoutService {
    private validateBookingDuration;
    createCheckout(driverId: string, data: CreateBookingCheckoutInput): Promise<{
        checkout: any;
        razorpayOrder: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder;
    }>;
    getCheckout(driverId: string, checkoutId: string): Promise<any>;
    verifyCheckoutPayment(driverId: string, checkoutId: string, orderId: string, paymentId: string, signature: string): Promise<{
        payment: any;
        booking: any;
        wallet: null;
        transaction: null;
        walletError: string;
    } | {
        walletError?: undefined;
        payment: any;
        booking: any;
        wallet: any;
        transaction: any;
    }>;
}
declare const _default: BookingCheckoutService;
export default _default;
