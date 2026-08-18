import ApiError from "../../utils/ApiError.js";

import userRepository from "../../repositories/user.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

class AdminService {
    // USERS
  
  async getUsers() {
    return userRepository.findAll();
  }

  async getUserById(userId: string) {
    const user = await userRepository.findByIdForAdmin(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return user;
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await userRepository.findByIdForAdmin(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const updatedUser = await userRepository.updateStatus(userId, isActive);

    if (!updatedUser) {
      throw new ApiError(500, "Unable to update user status.");
    }

    return updatedUser;
  }

    // PARKINGS
  
  async getParkings() {
    return parkingRepository.findAll();
  }

  async approveParking(parkingId: string) {
    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Inactive parking cannot be approved.");
    }

    if (parking.status === "approved") {
      throw new ApiError(400, "Parking is already approved.");
    }

    const updatedParking = await parkingRepository.approve(parkingId);

    if (!updatedParking) {
      throw new ApiError(500, "Unable to approve parking.");
    }

    return updatedParking;
  }

  async rejectParking(parkingId: string) {
    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.status === "rejected") {
      throw new ApiError(400, "Parking is already rejected.");
    }

    const updatedParking = await parkingRepository.reject(parkingId);

    if (!updatedParking) {
      throw new ApiError(500, "Unable to reject parking.");
    }

    return updatedParking;
  }

    // BOOKINGS
  
  async getBookings() {
    return bookingRepository.findAll();
  }

  async getBookingById(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    return booking;
  }

  async getParkingBookings(parkingId: string) {
    return bookingRepository.findByParking(parkingId);
  }

    // PAYMENTS
  
  async getPaymentById(paymentId: string) {
    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    return payment;
  }

  async getPaymentByBooking(bookingId: string) {
    const payment = await paymentRepository.findByBookingId(bookingId);

    if (!payment) {
      throw new ApiError(404, "Payment not found for this booking.");
    }

    return payment;
  }
  // DASHBOARD STATISTICS

async getDashboardStats() {
  const [
    users,
    parkings,
    bookings,
    payments,
  ] = await Promise.all([
    userRepository.findAll(),
    parkingRepository.findAll(),
    bookingRepository.findAll(),
    paymentRepository.findAll(),
  ]);

  // ----------------------------------------------------------
  // USER STATISTICS
  // ----------------------------------------------------------

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive,
  ).length;

  const inactiveUsers =
    totalUsers - activeUsers;

  // ----------------------------------------------------------
  // PARKING STATISTICS
  // ----------------------------------------------------------

  const totalParkings =
    parkings.length;

  const approvedParkings =
    parkings.filter(
      (parking) =>
        parking.status === "approved" &&
        parking.isActive,
    ).length;

  const pendingParkings =
    parkings.filter(
      (parking) =>
        parking.status === "pending",
    ).length;

  const rejectedParkings =
    parkings.filter(
      (parking) =>
        parking.status === "rejected",
    ).length;

  // ----------------------------------------------------------
  // BOOKING STATISTICS
  // ----------------------------------------------------------

  const totalBookings =
    bookings.length;

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "pending",
    ).length;

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "confirmed",
    ).length;

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "active",
    ).length;

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "completed",
    ).length;

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "cancelled",
    ).length;

  const expiredBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        "expired",
    ).length;

  // ----------------------------------------------------------
  // PAYMENT STATISTICS
  // ----------------------------------------------------------

  const totalPayments =
    payments.length;

  const successfulPayments =
    payments.filter(
      (payment) =>
        payment.status === "success",
    );

  const failedPayments =
    payments.filter(
      (payment) =>
        payment.status === "failed",
    );

  const totalRevenue =
    successfulPayments.reduce(
      (total, payment) =>
        total + payment.amount,
      0,
    );

  const totalRefunded =
    payments.reduce(
      (total, payment) =>
        total + payment.refundAmount,
      0,
    );

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },

    parkings: {
      total: totalParkings,
      approved: approvedParkings,
      pending: pendingParkings,
      rejected: rejectedParkings,
    },

    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      active: activeBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      expired: expiredBookings,
    },

    payments: {
      total: totalPayments,
      successful: successfulPayments.length,
      failed: failedPayments.length,
      totalRevenue: Number(
        totalRevenue.toFixed(2),
      ),
      totalRefunded: Number(
        totalRefunded.toFixed(2),
      ),
    },
  };
}
}

export default new AdminService();
