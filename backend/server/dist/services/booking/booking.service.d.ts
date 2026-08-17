import { CreateBookingInput } from "../../validations/booking/create.validation.js";
import { CancelBookingInput } from "../../validations/booking/cancel.validation.js";
import { CheckInInput } from "../../validations/booking/checkIn.validation.js";
declare class BookingService {
    private validateBookingDuration;
    private calculateCancellationRefund;
    createBooking(driverId: string, data: CreateBookingInput): Promise<{
        booking: any;
        payment: any;
        razorpayOrder: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder | {
            id: any;
            amount: number;
            currency: any;
        };
    }>;
    verifyPayment(orderId: string, paymentId: string, signature: string): Promise<{
        payment: any;
        booking: any;
        wallet: any;
        transaction: any;
    }>;
    createOvertimePayment(bookingId: string): Promise<{
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
    verifyOvertimePayment(orderId: string, paymentId: string, signature: string): Promise<{
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
    checkOut(ownerId: string, bookingId: string): Promise<{
        requiresAdditionalPayment: boolean;
        booking: any;
        overtime: {
            overtimeMinutes: number;
            overtimeParkingAmount: number;
            overtimeFine: number;
            overtimeTotal: number;
            overtimeHours?: undefined;
        };
    } | {
        requiresAdditionalPayment: boolean;
        booking: any;
        overtime: {
            overtimeMinutes: number;
            overtimeHours: number;
            overtimeParkingAmount: number;
            overtimeFine: number;
            overtimeTotal: number;
        };
    }>;
    private getBookedHours;
    expireBooking(): Promise<{
        pendingExpired: number;
        confirmedExpired: number;
        totalExpired: number;
    }>;
}
declare const _default: BookingService;
export default _default;
