import { CreateBookingInput } from "../../validations/booking/create.validation.js";
import { CancelBookingInput } from "../../validations/booking/cancel.validation.js";
import { CheckInInput } from "../../validations/booking/checkIn.validation.js";
declare class BookingService {
    private validateBookingDuration;
    private calculateCancellationRefund;
    createBooking(driverId: string, data: CreateBookingInput): Promise<{
        booking: any;
        payment: {
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
        };
    }>;
    verifyPayment(orderId: string, paymentId: string, signature: string): Promise<{
        payment: any;
        booking: any;
        wallet: any;
        transaction: any;
    }>;
    getBooking(userId: string, bookingId: string): Promise<any>;
    getDriverBookings(driverId: string): Promise<any[]>;
    getOwnerBookings(ownerId: string): Promise<any[]>;
    cancelBooking(driverId: string, bookingId: string, data: CancelBookingInput): Promise<{
        booking: any;
        refund: {
            refundAmount: number;
            penaltyAmount: number;
            refundPercentage: number;
        };
        payment: {
            payment: any;
            refund: import("razorpay/dist/types/refunds.js").Refunds.RazorpayRefund;
            wallet: {} | null;
            transaction: {} | null;
        } | null;
        wallet: {} | null;
        transaction: {} | null;
    }>;
    checkIn(ownerId: string, bookingId: string, data: CheckInInput): Promise<any>;
    checkOut(ownerId: string, bookingId: string): Promise<any>;
    expireBooking(): Promise<{
        pendingExpired: number;
        confirmedExpired: number;
        totalExpired: number;
    }>;
}
declare const _default: BookingService;
export default _default;
