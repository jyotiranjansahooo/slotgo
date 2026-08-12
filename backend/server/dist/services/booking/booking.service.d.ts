import { CreateBookingInput } from "../../validations/booking/create.validation.js";
import { CancelBookingInput } from "../../validations/booking/cancel.validation.js";
import { CheckInInput } from "../../validations/booking/checkIn.validation.js";
declare class BookingService {
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
    verifyPayment(orderId: string, paymentId: string, signature: string): Promise<any>;
    getBooking(userId: string, bookingId: string): Promise<any>;
    getDriverBookings(driverId: string): Promise<any[]>;
    getOwnerBookings(ownerId: string): Promise<any[]>;
    cancelBooking(driverId: string, bookingId: string, data: CancelBookingInput): Promise<any>;
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
