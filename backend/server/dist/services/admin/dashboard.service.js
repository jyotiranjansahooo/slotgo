import dashboardRepository from "../../repositories/dashboard.repository.js";
class DashboardService {
    async getDashboard() {
        const [users, parkings, bookings, payments,] = await Promise.all([
            dashboardRepository.getUserStats(),
            dashboardRepository.getParkingStats(),
            dashboardRepository.getBookingStats(),
            dashboardRepository.getPaymentStats(),
        ]);
        return {
            users,
            parkings,
            bookings,
            payments,
        };
    }
}
export default new DashboardService();
//# sourceMappingURL=dashboard.service.js.map