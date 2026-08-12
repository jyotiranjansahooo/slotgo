import ApiError from "../../utils/ApiError.js";

import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

import parkingRepository from "../../repositories/parking.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import userRepository from "../../repositories/user.repository.js";

import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import paymentService from "../payment/payment.service.js";
import pricingService from "./pricing.service.js";
import bookingNumberService from "./bookingNumber.service.js";
import verificationService from "./verification.service.js";
import qrService from "./qr.service.js";

import {
  BOOKING_STATUS,
  PAYMENT_STATUS as BOOKING_PAYMENT_STATUS,
  CANCELLED_BY,
  BookingMode,
} from "../../constants/booking.js";

import { PAYMENT_STATUS } from "../../constants/payment.js";

import { PARKING_STATUS } from "../../constants/parking.js";

import { CreateBookingInput } from "../../validations/booking/create.validation.js";
import { CancelBookingInput } from "../../validations/booking/cancel.validation.js";
import { CheckInInput } from "../../validations/booking/checkIn.validation.js";

class BookingService {
  // ============================================================
  // CREATE BOOKING
  // ============================================================

  async createBooking(driverId: string, data: CreateBookingInput) {
    // ----------------------------------------------------------
    // Driver validation
    // ----------------------------------------------------------

    const driver = await userRepository.findById(driverId);

    if (!driver) {
      throw new ApiError(404, "Driver not found.");
    }

    if (!driver.isActive) {
      throw new ApiError(400, "Driver account is inactive.");
    }

    // ----------------------------------------------------------
    // Vehicle validation
    // ----------------------------------------------------------

    const vehicle = await vehicleRepository.findById(data.vehicleId);

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found.");
    }

    if (vehicle.ownerId.toString() !== driverId) {
      throw new ApiError(403, "Vehicle does not belong to you.");
    }

    if (!vehicle.isActive) {
      throw new ApiError(400, "Vehicle is inactive.");
    }

    // ----------------------------------------------------------
    // Time validation
    // ----------------------------------------------------------

    if (data.startTime >= data.endTime) {
      throw new ApiError(400, "End time must be after start time.");
    }

    if (data.startTime < new Date()) {
      throw new ApiError(400, "Booking start time cannot be in the past.");
    }

    // ----------------------------------------------------------
    // Parking validation
    // ----------------------------------------------------------

    const parking = await parkingRepository.findById(data.parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.status !== PARKING_STATUS.APPROVED) {
      throw new ApiError(400, "Parking is not approved.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is inactive.");
    }

    // ----------------------------------------------------------
    // Booking mode validation
    // ----------------------------------------------------------

    const bookingEnabled = parking.bookingModes[data.bookingMode];

    if (!bookingEnabled) {
      throw new ApiError(400, `${data.bookingMode} booking is unavailable.`);
    }

    // ----------------------------------------------------------
    // Reserve compatible slot
    // ----------------------------------------------------------

    const slot = await slotAllocatorService.reserveAvailableSlot(
      parking._id.toString(),
      vehicle.vehicleType,
    );

    if (!slot) {
      throw new ApiError(400, "No parking slot available.");
    }

    // ----------------------------------------------------------
    // Calculate pricing
    // ----------------------------------------------------------

    const pricing = pricingService.calculate(
      parking,
      vehicle.vehicleType,
      data.bookingMode,
    );

    if (pricing.parkingAmount <= 0) {
      await slotAllocatorService.releaseSlot(slot._id.toString());

      throw new ApiError(
        400,
        "Pricing is not configured for this vehicle type and booking mode.",
      );
    }

    // ----------------------------------------------------------
    // Generate booking information
    // ----------------------------------------------------------

    const bookingNumber = bookingNumberService.generate();

    const verificationPin = verificationService.generatePin();

    const qrCode = await qrService.generate(bookingNumber);

    // ----------------------------------------------------------
    // Create booking
    // ----------------------------------------------------------

    let booking;

    try {
      booking = await bookingRepository.create({
        bookingNumber,

        driverId: driver._id,

        ownerId: parking.ownerId,

        parkingId: parking._id,

        slotId: slot._id,

        vehicleId: vehicle._id,

        vehicleType: vehicle.vehicleType,

        bookingMode: data.bookingMode as BookingMode,

        startTime: data.startTime,

        endTime: data.endTime,

        parkingAmount: pricing.parkingAmount,

        // Discount system is not implemented yet.
        discountAmount: 0,

        // Currently actual amount equals
        // the parking amount.
        actualAmount: pricing.parkingAmount,

        ownerCommission: pricing.ownerCommission,

        driverServiceFee: pricing.driverServiceFee,

        ownerReceives: pricing.ownerReceives,

        driverPays: pricing.driverPays,

        paymentStatus: BOOKING_PAYMENT_STATUS.PENDING,

        bookingStatus: BOOKING_STATUS.PENDING,

        verificationPin,

        qrCode,

        driverSnapshot: {
          name: `${driver.name.first} ${driver.name.last}`,
          phoneNumber: driver.phoneNumber,
        },

        parkingSnapshot: {
          parkingName: parking.parkingName,

          address: parking.address,
        },

        vehicleSnapshot: {
          registrationNumber: vehicle.registrationNumber,
          brand: vehicle.brand,
          vehicleModel: vehicle.vehicleModel,
          vehicleType: vehicle.vehicleType,
        },
      });
    } catch (error) {
      // Booking creation failed,
      // so release temporary slot reservation.
      await slotAllocatorService.releaseSlot(slot._id.toString());

      throw error;
    }

    // ----------------------------------------------------------
    // Create payment
    // ----------------------------------------------------------

    try {
      const payment = await paymentService.createPayment(
        booking._id.toString(),
      );

      return {
        booking,
        payment,
      };
    } catch (error) {
      // Payment creation failed.
      // Release temporary slot.
      await slotAllocatorService.releaseSlot(slot._id.toString());

      // Remove incomplete booking.
      await bookingRepository.delete(booking._id.toString());

      throw error;
    }
  }

  // ============================================================
  // VERIFY PAYMENT
  // ============================================================

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return paymentService.verifyPayment(orderId, paymentId, signature);
  }

  // ============================================================
  // GET SINGLE BOOKING
  // ============================================================

  async getBooking(userId: string, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    const isDriver = booking.driverId.toString() === userId;

    const isOwner = booking.ownerId.toString() === userId;

    if (!isDriver && !isOwner) {
      throw new ApiError(403, "You are not authorized to view this booking.");
    }

    return booking;
  }

  // ============================================================
  // DRIVER BOOKINGS
  // ============================================================

  async getDriverBookings(driverId: string) {
    return bookingRepository.findByDriver(driverId);
  }

  // ============================================================
  // OWNER BOOKINGS
  // ============================================================

  async getOwnerBookings(ownerId: string) {
    return bookingRepository.findByOwner(ownerId);
  }

  // ============================================================
  // CANCEL BOOKING
  // ============================================================

  async cancelBooking(
    driverId: string,
    bookingId: string,
    data: CancelBookingInput,
  ) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // Only booking driver can cancel.
    if (booking.driverId.toString() !== driverId) {
      throw new ApiError(403, "You are not authorized to cancel this booking.");
    }

    // ----------------------------------------------------------
    // Status validation
    // ----------------------------------------------------------

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, "Booking is already cancelled.");
    }

    if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
      throw new ApiError(400, "Completed bookings cannot be cancelled.");
    }

    if (booking.bookingStatus === BOOKING_STATUS.ACTIVE) {
      throw new ApiError(400, "Active bookings cannot be cancelled.");
    }

    if (booking.bookingStatus === BOOKING_STATUS.EXPIRED) {
      throw new ApiError(400, "Expired bookings cannot be cancelled.");
    }

    // ----------------------------------------------------------
    // Refund calculation
    // ----------------------------------------------------------

    let refundAmount = 0;

    const penaltyAmount = 0;

    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
      refundAmount = booking.driverPays;
    }

    // ----------------------------------------------------------
    // Refund payment
    // ----------------------------------------------------------

    if (refundAmount > 0) {
      const payment = await paymentRepository.findByBookingId(
        booking._id.toString(),
      );

      if (!payment) {
        throw new ApiError(404, "Payment record not found.");
      }

      if (payment.status === PAYMENT_STATUS.SUCCESS) {
        await paymentService.refundPayment(
          payment._id.toString(),
          refundAmount,
        );
      }
    }

    // ----------------------------------------------------------
    // Release slot
    // ----------------------------------------------------------

    await slotAllocatorService.releaseSlot(booking.slotId.toString());

    // ----------------------------------------------------------
    // Update booking
    // ----------------------------------------------------------

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,

        cancellation: {
          cancelledBy: CANCELLED_BY.DRIVER,

          reason: data.reason,

          cancelledAt: new Date(),

          refundAmount,

          penaltyAmount,
        },
      },
    );

    if (!updatedBooking) {
      throw new ApiError(500, "Unable to cancel booking.");
    }

    return updatedBooking;
  }

  // ============================================================
  // CHECK-IN
  // ============================================================

  async checkIn(ownerId: string, bookingId: string, data: CheckInInput) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // Only parking owner can check in.
    if (booking.ownerId.toString() !== ownerId) {
      throw new ApiError(
        403,
        "You are not authorized to check in this booking.",
      );
    }

    // Must be confirmed.
    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new ApiError(
        400,
        `Booking cannot be checked in because its status is "${booking.bookingStatus}".`,
      );
    }

    // Verify PIN.
    if (booking.verificationPin !== data.verificationPin) {
      throw new ApiError(400, "Invalid verification PIN.");
    }

    const now = new Date();

    // Booking hasn't started.
    if (now < booking.startTime) {
      throw new ApiError(400, "Check-in time has not started yet.");
    }

    // Booking has already ended.
    if (now >= booking.endTime) {
      throw new ApiError(400, "Booking has already expired.");
    }

    // ----------------------------------------------------------
    // Occupy slot
    // ----------------------------------------------------------

    await slotAllocatorService.occupySlot(booking.slotId.toString());

    // ----------------------------------------------------------
    // Update booking
    // ----------------------------------------------------------

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.ACTIVE,

        checkedInAt: now,
      },
    );

    if (!updatedBooking) {
      // Restore slot if update fails.
      await slotAllocatorService.releaseSlot(booking.slotId.toString());

      throw new ApiError(500, "Unable to complete check-in.");
    }

    return updatedBooking;
  }

  // ============================================================
  // CHECK-OUT
  // ============================================================

  async checkOut(ownerId: string, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // Only parking owner can check out.
    if (booking.ownerId.toString() !== ownerId) {
      throw new ApiError(
        403,
        "You are not authorized to check out this booking.",
      );
    }

    // Must be active.
    if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
      throw new ApiError(
        400,
        `Booking cannot be checked out because its status is "${booking.bookingStatus}".`,
      );
    }

    const now = new Date();

    // ----------------------------------------------------------
    // Release slot
    // ----------------------------------------------------------

    await slotAllocatorService.releaseSlot(booking.slotId.toString());

    // ----------------------------------------------------------
    // Complete booking
    // ----------------------------------------------------------

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.COMPLETED,

        checkedOutAt: now,
      },
    );

    if (!updatedBooking) {
      // Restore occupied state.
      await slotAllocatorService.occupySlot(booking.slotId.toString());

      throw new ApiError(500, "Unable to complete check-out.");
    }

    return updatedBooking;
  }

  // ============================================================
  // EXPIRE BOOKINGS
  // ============================================================

  async expireBooking() {
    const now = new Date();

    let pendingExpired = 0;
    let confirmedExpired = 0;

    // ----------------------------------------------------------
    // Expire pending bookings
    // ----------------------------------------------------------

    const pendingBookings =
      await bookingRepository.findExpiredPendingBookings(now);

    for (const booking of pendingBookings) {
      await slotAllocatorService.releaseSlot(booking.slotId.toString());

      await bookingRepository.update(booking._id.toString(), {
        bookingStatus: BOOKING_STATUS.EXPIRED,
      });

      pendingExpired++;
    }

    // ----------------------------------------------------------
    // Expire confirmed/active bookings
    // ----------------------------------------------------------

    const confirmedBookings =
      await bookingRepository.findExpiredConfirmedBookings(now);

    for (const booking of confirmedBookings) {
      await slotAllocatorService.releaseSlot(booking.slotId.toString());

      await bookingRepository.update(booking._id.toString(), {
        bookingStatus: BOOKING_STATUS.EXPIRED,

        checkedOutAt: booking.checkedOutAt ?? now,
      });

      confirmedExpired++;
    }

    return {
      pendingExpired,
      confirmedExpired,
      totalExpired: pendingExpired + confirmedExpired,
    };
  }
}

export default new BookingService();
