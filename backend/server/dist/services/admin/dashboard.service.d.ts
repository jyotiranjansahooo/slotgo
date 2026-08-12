declare class DashboardService {
    getDashboard(): Promise<{
        users: {
            totalUsers: number;
            drivers: number;
            parkingOwners: number;
            activeUsers: number;
        };
        parkings: {
            totalParkings: number;
            pendingParkings: number;
            approvedParkings: number;
            rejectedParkings: number;
            activeParkings: number;
        };
        bookings: {
            totalBookings: number;
            pendingBookings: number;
            confirmedBookings: number;
            activeBookings: number;
            completedBookings: number;
            cancelledBookings: number;
            expiredBookings: number;
        };
        payments: {
            totalPayments: number;
            successfulPayments: number;
            pendingPayments: number;
            failedPayments: number;
            refundedPayments: number;
            totalRevenue: any;
        };
    }>;
}
declare const _default: DashboardService;
export default _default;
