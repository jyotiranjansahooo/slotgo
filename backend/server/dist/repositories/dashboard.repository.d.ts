declare class DashboardRepository {
    getUserStats(): Promise<{
        totalUsers: number;
        drivers: number;
        parkingOwners: number;
        activeUsers: number;
    }>;
    getParkingStats(): Promise<{
        totalParkings: number;
        pendingParkings: number;
        approvedParkings: number;
        rejectedParkings: number;
        activeParkings: number;
    }>;
    getBookingStats(): Promise<{
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        activeBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        expiredBookings: number;
    }>;
    getPaymentStats(): Promise<{
        totalPayments: number;
        successfulPayments: number;
        pendingPayments: number;
        failedPayments: number;
        refundedPayments: number;
        totalRevenue: any;
    }>;
}
declare const _default: DashboardRepository;
export default _default;
