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
  // VALIDATE BOOKING DURATION

  private validateBookingDuration(
    startTime: Date,
    endTime: Date,
    bookingMode: BookingMode,
  ) {
    const durationMs = endTime.getTime() - startTime.getTime();

    const durationHours = durationMs / (1000 * 60 * 60);

    switch (bookingMode) {
      // --------------------------------------------------------
      // HOURLY
      // --------------------------------------------------------

      case "hourly": {
        if (durationHours < 1) {
          throw new ApiError(400, "Hourly booking must be at least 1 hour.");
        }

        if (!Number.isInteger(durationHours)) {
          throw new ApiError(
            400,
            "Hourly booking duration must be a whole number of hours.",
          );
        }

        break;
      }

      // --------------------------------------------------------
      // DAILY
      // --------------------------------------------------------

      case "daily": {
        if (durationHours < 24) {
          throw new ApiError(400, "Daily booking must be at least 24 hours.");
        }

        if (durationHours % 24 !== 0) {
          throw new ApiError(
            400,
            "Daily booking duration must be in complete days.",
          );
        }

        break;
      }

      // --------------------------------------------------------
      // MONTHLY
      // --------------------------------------------------------

      case "monthly": {
        if (durationHours < 24 * 28) {
          throw new ApiError(400, "Monthly booking must be at least 28 days.");
        }

        break;
      }

      default:
        throw new ApiError(400, "Invalid booking mode.");
    }
  }

  // CALCULATE CANCELLATION REFUND

  private calculateCancellationRefund(booking: {
    driverPays: number;
    startTime: Date;
  }) {
    const now = new Date();

    const remainingMs = booking.startTime.getTime() - now.getTime();

    const remainingHours = remainingMs / (1000 * 60 * 60);

    let refundPercentage = 0;

    // More than 24 hours before booking
    if (remainingHours > 24) {
      refundPercentage = 100;
    }

    // Between 2 and 24 hours
    else if (remainingHours > 2) {
      refundPercentage = 75;
    }

    // Between 1 and 2 hours
    else if (remainingHours > 1) {
      refundPercentage = 50;
    }

    // Less than 1 hour
    else {
      refundPercentage = 0;
    }

    const refundAmount = Number(
      (booking.driverPays * (refundPercentage / 100)).toFixed(2),
    );

    const penaltyAmount = Number(
      (booking.driverPays - refundAmount).toFixed(2),
    );

    return {
      refundAmount,
      penaltyAmount,
      refundPercentage,
    };
  }

  // CREATE BOOKING

  async createBooking(driverId: string, data: CreateBookingInput) {
    // DRIVER VALIDATION

    const driver = await userRepository.findById(driverId);

    if (!driver) {
      throw new ApiError(404, "Driver not found.");
    }

    if (!driver.isActive) {
      throw new ApiError(400, "Driver account is inactive.");
    }

    // VEHICLE VALIDATION

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

    // TIME VALIDATION

    if (data.startTime >= data.endTime) {
      throw new ApiError(400, "End time must be after start time.");
    }

    if (data.startTime < new Date()) {
      throw new ApiError(400, "Booking start time cannot be in the past.");
    }

    this.validateBookingDuration(
      data.startTime,
      data.endTime,
      data.bookingMode as BookingMode,
    );

    // VEHICLE BOOKING OVERLAP

    const overlappingBooking = await bookingRepository.findOverlappingBooking(
      vehicle._id.toString(),
      data.startTime,
      data.endTime,
    );

    if (overlappingBooking) {
      throw new ApiError(
        409,
        "This vehicle already has an overlapping booking.",
      );
    }

    // PARKING VALIDATION

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

    // BOOKING MODE VALIDATION

    const bookingEnabled = parking.bookingModes[data.bookingMode];

    if (!bookingEnabled) {
      throw new ApiError(400, `${data.bookingMode} booking is unavailable.`);
    }

    // RESERVE PARKING SLOT

    const slot = await slotAllocatorService.reserveAvailableSlot(
      parking._id.toString(),
      vehicle.vehicleType,
    );

    if (!slot) {
      throw new ApiError(409, "No parking slot available.");
    }

    // CALCULATE PRICING

    let pricing;

    try {
      pricing = pricingService.calculate(
        parking,
        vehicle.vehicleType,
        data.bookingMode as BookingMode,
        data.startTime,
        data.endTime,
      );
    } catch (error) {
      await slotAllocatorService.releaseSlot(slot._id.toString());

      throw error;
    }

    if (pricing.parkingAmount <= 0) {
      await slotAllocatorService.releaseSlot(slot._id.toString());

      throw new ApiError(
        400,
        "Pricing is not configured for this vehicle type and booking mode.",
      );
    }

    // GENERATE BOOKING DATA

    const bookingNumber = bookingNumberService.generate();

    const verificationPin = verificationService.generatePin();

    const qrCode = await qrService.generate(bookingNumber);

    // CREATE BOOKING

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

        discountAmount: pricing.discountAmount,

        actualAmount: pricing.actualAmount,

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
      // Release slot if booking creation fails.

      await slotAllocatorService.releaseSlot(slot._id.toString());

      throw error;
    }

    // CREATE PAYMENT

    try {
      const payment = await paymentService.createPayment(
        booking._id.toString(),
      );

      return {
        booking,
        payment,
      };
    } catch (error) {
      // Release slot.

      await slotAllocatorService.releaseSlot(slot._id.toString());

      // Delete incomplete booking.

      await bookingRepository.delete(booking._id.toString());

      throw error;
    }
  }

  // VERIFY PAYMENT

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return paymentService.verifyPayment(orderId, paymentId, signature);
  }

  // GET SINGLE BOOKING

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

  // GET DRIVER BOOKINGS

  async getDriverBookings(driverId: string) {
    return bookingRepository.findByDriver(driverId);
  }
  async getOwnerBookings(
  ownerId: string,
) {
  return bookingRepository.findByOwner(
    ownerId,
  );
}

  // CANCEL BOOKING

  async cancelBooking(
    driverId: string,
    bookingId: string,
    data: CancelBookingInput,
  ) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // DRIVER AUTHORIZATION

    if (booking.driverId.toString() !== driverId) {
      throw new ApiError(403, "You are not authorized to cancel this booking.");
    }

    // STATUS VALIDATION

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

    // CALCULATE REFUND

    let refundAmount = 0;
    let penaltyAmount = 0;

    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
      const cancellation = this.calculateCancellationRefund(booking);

      refundAmount = cancellation.refundAmount;

      penaltyAmount = cancellation.penaltyAmount;
    }

    // REFUND PAYMENT

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

    // RELEASE SLOT

    await slotAllocatorService.releaseSlot(booking.slotId.toString());

    // DETERMINE PAYMENT STATUS

    let paymentStatus = booking.paymentStatus;

    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
      if (refundAmount >= booking.driverPays) {
        paymentStatus = BOOKING_PAYMENT_STATUS.REFUNDED;
      }
    }

    // UPDATE BOOKING

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,

        paymentStatus,

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

  // CHECK IN

  async checkIn(ownerId: string, bookingId: string, data: CheckInInput) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // OWNER AUTHORIZATION

    if (booking.ownerId.toString() !== ownerId) {
      throw new ApiError(
        403,
        "You are not authorized to check in this booking.",
      );
    }

    // BOOKING STATUS

    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new ApiError(
        400,
        `Booking cannot be checked in because its status is "${booking.bookingStatus}".`,
      );
    }

    // PAYMENT STATUS

    if (booking.paymentStatus !== BOOKING_PAYMENT_STATUS.PAID) {
      throw new ApiError(400, "Booking payment has not been completed.");
    }

    // VERIFY PIN

    if (booking.verificationPin !== data.verificationPin) {
      throw new ApiError(400, "Invalid verification PIN.");
    }

    // CHECK BOOKING TIME

    const now = new Date();

    if (now < booking.startTime) {
      throw new ApiError(400, "Check-in time has not started yet.");
    }

    if (now >= booking.endTime) {
      throw new ApiError(400, "Booking has already expired.");
    }

    // OCCUPY SLOT

    await slotAllocatorService.occupySlot(booking.slotId.toString());

    // UPDATE BOOKING

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.ACTIVE,

        checkedInAt: now,
      },
    );

    if (!updatedBooking) {
      // Restore slot if booking update fails.

      await slotAllocatorService.releaseSlot(booking.slotId.toString());

      throw new ApiError(500, "Unable to complete check-in.");
    }

    return updatedBooking;
  }

  // CHECK OUT

  async checkOut(ownerId: string, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // OWNER AUTHORIZATION

    if (booking.ownerId.toString() !== ownerId) {
      throw new ApiError(
        403,
        "You are not authorized to check out this booking.",
      );
    }

    // STATUS VALIDATION

    if (booking.bookingStatus !== BOOKING_STATUS.ACTIVE) {
      throw new ApiError(
        400,
        `Booking cannot be checked out because its status is "${booking.bookingStatus}".`,
      );
    }

    const now = new Date();

    // RELEASE SLOT

    await slotAllocatorService.releaseSlot(booking.slotId.toString());

    // COMPLETE BOOKING

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        bookingStatus: BOOKING_STATUS.COMPLETED,

        checkedOutAt: now,
      },
    );

    if (!updatedBooking) {
      // Restore occupied state if update fails.

      await slotAllocatorService.occupySlot(booking.slotId.toString());

      throw new ApiError(500, "Unable to complete check-out.");
    }

    return updatedBooking;
  }

  // EXPIRE BOOKINGS

  async expireBooking() {
    const now = new Date();

    let pendingExpired = 0;
    let confirmedExpired = 0;

    // EXPIRE UNPAID BOOKINGS

    const pendingBookings =
      await bookingRepository.findExpiredPendingBookings(now);

    for (const booking of pendingBookings) {
      await slotAllocatorService.releaseSlot(booking.slotId.toString());

      await bookingRepository.update(booking._id.toString(), {
        bookingStatus: BOOKING_STATUS.EXPIRED,
      });

      pendingExpired++;
    }

    // EXPIRE CONFIRMED BOOKINGS

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
