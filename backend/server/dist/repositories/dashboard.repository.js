import User from "../models/User.js";
import Parking from "../models/Parking.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { USER_ROLES, } from "../constants/roles.js";
import { PARKING_STATUS, } from "../constants/parking.js";
import { BOOKING_STATUS, } from "../constants/booking.js";
import { PAYMENT_STATUS, } from "../constants/payment.js";
class DashboardRepository {
    async getUserStats() {
        const [totalUsers, drivers, parkingOwners, activeUsers,] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({
                role: USER_ROLES.DRIVER,
            }),
            User.countDocuments({
                role: USER_ROLES.PARKING_OWNER,
            }),
            User.countDocuments({
                isActive: true,
            }),
        ]);
        return {
            totalUsers,
            drivers,
            parkingOwners,
            activeUsers,
        };
    }
    async getParkingStats() {
        const [totalParkings, pendingParkings, approvedParkings, rejectedParkings, activeParkings,] = await Promise.all([
            Parking.countDocuments(),
            Parking.countDocuments({
                status: PARKING_STATUS.PENDING,
            }),
            Parking.countDocuments({
                status: PARKING_STATUS.APPROVED,
            }),
            Parking.countDocuments({
                status: PARKING_STATUS.REJECTED,
            }),
            Parking.countDocuments({
                isActive: true,
            }),
        ]);
        return {
            totalParkings,
            pendingParkings,
            approvedParkings,
            rejectedParkings,
            activeParkings,
        };
    }
    async getBookingStats() {
        const [totalBookings, pendingBookings, confirmedBookings, activeBookings, completedBookings, cancelledBookings, expiredBookings,] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.PENDING,
            }),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.CONFIRMED,
            }),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.ACTIVE,
            }),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.COMPLETED,
            }),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.CANCELLED,
            }),
            Booking.countDocuments({
                bookingStatus: BOOKING_STATUS.EXPIRED,
            }),
        ]);
        return {
            totalBookings,
            pendingBookings,
            confirmedBookings,
            activeBookings,
            completedBookings,
            cancelledBookings,
            expiredBookings,
        };
    }
    async getPaymentStats() {
        const [totalPayments, successfulPayments, pendingPayments, failedPayments, refundedPayments,] = await Promise.all([
            Payment.countDocuments(),
            Payment.countDocuments({
                status: PAYMENT_STATUS.SUCCESS,
            }),
            Payment.countDocuments({
                status: PAYMENT_STATUS.CREATED,
            }),
            Payment.countDocuments({
                status: PAYMENT_STATUS.FAILED,
            }),
            Payment.countDocuments({
                status: PAYMENT_STATUS.REFUNDED,
            }),
        ]);
        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    status: PAYMENT_STATUS.SUCCESS,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount",
                    },
                },
            },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue ?? 0;
        return {
            totalPayments,
            successfulPayments,
            pendingPayments,
            failedPayments,
            refundedPayments,
            totalRevenue,
        };
    }
}
export default new DashboardRepository();
//# sourceMappingURL=dashboard.repository.js.map