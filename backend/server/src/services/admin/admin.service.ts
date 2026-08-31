import ApiError from "../../utils/ApiError.js";
import User from "../../models/User.js";
import { USER_ROLES } from "../../constants/roles.js";
import userRepository from "../../repositories/user.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

class AdminService {  
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

async updateUserRole(
  targetUserId: string,
  newRole: "driver" | "parkingOwner" | "admin",
  currentAdminId: string,
) {
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  /*
   * Prevent an admin from changing their own role.
   */
  if (targetUser._id.toString() === currentAdminId) {
    throw new ApiError(
      400,
      "You cannot change your own administrator role.",
    );
  }

  /*
   * If removing admin privileges, make sure
   * at least one administrator remains.
   */
  if (
    targetUser.role === USER_ROLES.ADMIN &&
    newRole !== USER_ROLES.ADMIN
  ) {
    const adminCount = await User.countDocuments({
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    if (adminCount <= 1) {
      throw new ApiError(
        400,
        "Cannot remove the last administrator.",
      );
    }
  }

  /*
   * Nothing to change.
   */
  if (targetUser.role === newRole) {
    throw new ApiError(
      400,
      `User is already a ${newRole}.`,
    );
  }

  targetUser.role = newRole;

  /*
   * Clear refresh token so the user must authenticate again.
   */
  targetUser.refreshToken = "";

  await targetUser.save();

  return {
    id: targetUser._id.toString(),
    name: targetUser.name,
    email: targetUser.email,
    phoneNumber: targetUser.phoneNumber,
    role: targetUser.role,
    isActive: targetUser.isActive,
    isVerified: targetUser.isVerified,
  };
}  
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
