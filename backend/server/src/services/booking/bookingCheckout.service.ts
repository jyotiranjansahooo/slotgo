import { Types } from "mongoose";

import ApiError from "../../utils/ApiError.js";

import bookingRepository from "../../repositories/booking.repository.js";
import bookingCheckoutRepository from "../../repositories/bookingCheckout.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

import parkingRepository from "../../repositories/parking.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import userRepository from "../../repositories/user.repository.js";

import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import pricingService from "./pricing.service.js";

import razorpayService from "../payment/razorpay.service.js";

import bookingNumberService from "./bookingNumber.service.js";
import verificationService from "./verification.service.js";
import qrService from "./qr.service.js";

import walletService from "../wallet/wallet.service.js";

import {
  BOOKING_MODE_VALUES,
  BookingMode,
  BOOKING_STATUS,
  PAYMENT_STATUS as BOOKING_PAYMENT_STATUS,
} from "../../constants/booking.js";

import {
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  REFUND_STATUS,
} from "../../constants/payment.js";

import { PARKING_STATUS } from "../../constants/parking.js";

import { CreateBookingCheckoutInput } from "../../validations/booking/checkout.validation.js";

class BookingCheckoutService {
  private validateBookingDuration(
    startTime: Date,
    endTime: Date,
    bookingMode: BookingMode,
  ) {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours <= 0) {
      throw new ApiError(400, "Booking duration must be greater than zero.");
    }

    switch (bookingMode) {
      case "hourly":
        if (durationHours < 1) {
          throw new ApiError(400, "Hourly booking must be at least 1 hour.");
        }

        if (!Number.isInteger(durationHours)) {
          throw new ApiError(400, "Hourly booking must use whole hours.");
        }

        if (durationHours > 24) {
          throw new ApiError(400, "Hourly booking cannot exceed 24 hours.");
        }

        break;

      case "daily":
        if (durationHours < 24) {
          throw new ApiError(400, "Daily booking must be at least 1 day.");
        }

        if (durationHours % 24 !== 0) {
          throw new ApiError(400, "Daily booking must use complete days.");
        }

        if (durationHours / 24 > 30) {
          throw new ApiError(400, "Daily booking cannot exceed 30 days.");
        }

        break;

      case "monthly":
        if (durationHours < 24 * 28) {
          throw new ApiError(400, "Monthly booking must be at least 28 days.");
        }

        if (durationHours / (24 * 28) > 12) {
          throw new ApiError(400, "Monthly booking cannot exceed 12 months.");
        }

        break;

      default:
        throw new ApiError(400, "Invalid booking mode.");
    }
  }

  async createCheckout(driverId: string, data: CreateBookingCheckoutInput) {
    const driver = await userRepository.findById(driverId);

    if (!driver) {
      throw new ApiError(404, "Driver not found.");
    }

    if (!driver.isActive) {
      throw new ApiError(400, "Driver account is inactive.");
    }

    if (!driver.phoneNumber) {
      throw new ApiError(
        400,
        "Phone number is required before creating a booking.",
      );
    }

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

    const now = new Date();

    if (data.startTime >= data.endTime) {
      throw new ApiError(400, "End time must be after start time.");
    }

    if (data.startTime < now) {
      throw new ApiError(400, "Booking start time cannot be in the past.");
    }

    this.validateBookingDuration(
      data.startTime,
      data.endTime,
      data.bookingMode as BookingMode,
    );

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

    if (
      !BOOKING_MODE_VALUES.includes(
        data.bookingMode as (typeof BOOKING_MODE_VALUES)[number],
      )
    ) {
      throw new ApiError(400, "Invalid booking mode.");
    }

    const bookingEnabled = parking.bookingModes[data.bookingMode];

    if (!bookingEnabled) {
      throw new ApiError(400, `${data.bookingMode} booking is unavailable.`);
    }

    const slot = await slotAllocatorService.reserveAvailableSlot(
      parking._id.toString(),
      vehicle.vehicleType,
    );

    if (!slot) {
      throw new ApiError(409, "No parking capacity available.");
    }

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

    const checkoutDurationMs = 15 * 60 * 1000;

    const reservedUntil = new Date(Date.now() + checkoutDurationMs);

    const expiresAt = new Date(reservedUntil);

    let razorpayOrder;

    try {
      razorpayOrder = await razorpayService.createOrder(
        Math.round(pricing.driverPays * 100),
        `checkout-${Date.now()}`,
      );
    } catch (error) {
      await slotAllocatorService.releaseSlot(slot._id.toString());
      throw error;
    }

    try {
      const checkout = await bookingCheckoutRepository.create({
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
        orderId: razorpayOrder.id,
        reservedUntil,
        expiresAt,
      });

      return {
        checkout,
        razorpayOrder,
      };
    } catch (error) {
      await slotAllocatorService.releaseSlot(slot._id.toString());
      throw error;
    }
  }

  async getCheckout(driverId: string, checkoutId: string) {
    if (!Types.ObjectId.isValid(checkoutId)) {
      throw new ApiError(400, "Invalid checkout ID.");
    }

    const checkout = await bookingCheckoutRepository.findById(checkoutId);

    if (!checkout) {
      throw new ApiError(404, "Booking checkout not found.");
    }

    if (checkout.driverId.toString() !== driverId) {
      throw new ApiError(403, "You are not authorized to view this checkout.");
    }

    if (checkout.expiresAt <= new Date()) {
      await slotAllocatorService.releaseSlot(checkout.slotId.toString());

      await bookingCheckoutRepository.delete(checkout._id.toString());

      throw new ApiError(
        410,
        "This checkout has expired. Please start the booking again.",
      );
    }

    return checkout;
  }

  async verifyCheckoutPayment(
    driverId: string,
    checkoutId: string,
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    if (!Types.ObjectId.isValid(checkoutId)) {
      throw new ApiError(400, "Invalid checkout ID.");
    }

    if (!orderId?.trim()) {
      throw new ApiError(400, "Razorpay order ID is required.");
    }

    if (!paymentId?.trim()) {
      throw new ApiError(400, "Razorpay payment ID is required.");
    }

    if (!signature?.trim()) {
      throw new ApiError(400, "Razorpay payment signature is required.");
    }

    const checkout = await bookingCheckoutRepository.findById(checkoutId);

    if (!checkout) {
      throw new ApiError(
        404,
        "Booking checkout not found or already completed.",
      );
    }

    if (checkout.driverId.toString() !== driverId) {
      throw new ApiError(
        403,
        "You are not authorized to complete this checkout.",
      );
    }

    if (checkout.orderId !== orderId) {
      throw new ApiError(400, "Payment order does not match this checkout.");
    }

    const now = new Date();

    if (checkout.expiresAt <= now) {
      await slotAllocatorService.releaseSlot(checkout.slotId.toString());

      await bookingCheckoutRepository.delete(checkout._id.toString());

      throw new ApiError(
        410,
        "This checkout has expired. Please start the booking again.",
      );
    }

    const isValid = razorpayService.verifySignature(
      orderId,
      paymentId,
      signature,
    );

    if (!isValid) {
      await slotAllocatorService.releaseSlot(checkout.slotId.toString());

      await bookingCheckoutRepository.delete(checkout._id.toString());

      throw new ApiError(400, "Invalid payment signature.");
    }

    const driver = await userRepository.findById(driverId);

    if (!driver) {
      throw new ApiError(404, "Driver not found.");
    }

    if (!driver.isActive) {
      throw new ApiError(400, "Driver account is inactive.");
    }

    if (!driver.phoneNumber) {
      throw new ApiError(
        400,
        "Phone number is required before creating a booking.",
      );
    }

    const vehicle = await vehicleRepository.findById(
      checkout.vehicleId.toString(),
    );

    if (!vehicle) {
      throw new ApiError(
        404,
        "Vehicle associated with checkout was not found.",
      );
    }

    if (vehicle.ownerId.toString() !== driverId) {
      throw new ApiError(403, "Vehicle does not belong to this driver.");
    }

    const parking = await parkingRepository.findById(
      checkout.parkingId.toString(),
    );

    if (!parking) {
      throw new ApiError(
        404,
        "Parking associated with checkout was not found.",
      );
    }

    if (parking.status !== PARKING_STATUS.APPROVED) {
      throw new ApiError(400, "Parking is no longer approved.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is no longer active.");
    }

    const slot = await slotAllocatorService.confirmReservation(
      checkout.slotId.toString(),
    );

    if (!slot) {
      throw new ApiError(
        409,
        "Parking capacity reservation could not be confirmed.",
      );
    }

    const bookingNumber = bookingNumberService.generate();

    const verificationPin = verificationService.generatePin();

    const qrCode = await qrService.generate(bookingNumber);

    let booking;

    try {
      booking = await bookingRepository.create({
        bookingNumber,

        driverId: checkout.driverId,
        ownerId: checkout.ownerId,

        parkingId: checkout.parkingId,

        slotId: checkout.slotId,

        vehicleId: checkout.vehicleId,

        vehicleType: checkout.vehicleType,

        bookingMode: checkout.bookingMode,

        startTime: checkout.startTime,

        endTime: checkout.endTime,

        parkingAmount: checkout.parkingAmount,

        discountAmount: checkout.discountAmount,

        actualAmount: checkout.actualAmount,

        ownerCommission: checkout.ownerCommission,

        driverServiceFee: checkout.driverServiceFee,

        ownerReceives: checkout.ownerReceives,

        driverPays: checkout.driverPays,

        paymentStatus: BOOKING_PAYMENT_STATUS.PAID,

        bookingStatus: BOOKING_STATUS.CONFIRMED,

        overtimeMinutes: 0,

        overtimeParkingAmount: 0,

        overtimeFine: 0,

        overtimeTotal: 0,

        overtimePaymentStatus: PAYMENT_STATUS.PENDING,

        verificationPin,

        qrCode,

        payment: {
          method: "online",
          gateway: PAYMENT_GATEWAY.RAZORPAY,
          transactionId: paymentId,
          paidAt: now,
        },

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
      await slotAllocatorService.releaseSlot(checkout.slotId.toString());

      throw error;
    }

    let payment;

    try {
      payment = await paymentRepository.create({
        bookingId: booking._id,

        driverId: checkout.driverId,

        ownerId: checkout.ownerId,

        gateway: PAYMENT_GATEWAY.RAZORPAY,

        orderId,

        paymentId,

        signature,

        amount: checkout.driverPays,

        currency: "INR",

        status: PAYMENT_STATUS.SUCCESS,

        paidAt: now,

        refundAmount: 0,

        refundStatus: REFUND_STATUS.NONE,
      });
    } catch (error) {
      await bookingRepository.delete(booking._id.toString());

      await slotAllocatorService.releaseSlot(checkout.slotId.toString());

      throw error;
    }

    await bookingCheckoutRepository.delete(checkout._id.toString());

    let walletResult;

    try {
      walletResult = await walletService.creditOwnerEarnings(
        booking.ownerId.toString(),
        booking.ownerReceives,
        booking._id.toString(),
        `booking:${booking._id.toString()}`,
        `Earnings from booking ${booking.bookingNumber}`,
      );
    } catch (error) {
      return {
        payment,
        booking,
        wallet: null,
        transaction: null,
        walletError:
          "Booking and payment were completed, but owner wallet credit could not be completed automatically.",
      };
    }

    return {
      payment,
      booking,
      wallet: walletResult.wallet,
      transaction: walletResult.transaction,
    };
  }
}

export default new BookingCheckoutService();
