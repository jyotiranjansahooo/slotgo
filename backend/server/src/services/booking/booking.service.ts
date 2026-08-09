import ApiError from "../../utils/ApiError.js";
import bookingRepository from "../../repositories/booking.repository.js";

import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import paymentService from "../payment/payment.service.js";
import pricingService from "./pricing.service.js";
import bookingNumberService from "./bookingNumber.service.js";
import verificationService from "./verification.service.js";
import qrService from "./qr.service.js";
import { BookingMode } from "../../constants/booking.js";
import { PAYMENT_STATUS } from "../../constants/booking.js";
import parkingRepository from "../../repositories/parking.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import { PARKING_STATUS } from "../../constants/parking.js";

import { CreateBookingInput } from "../../validations/booking/create.validation.js";

class BookingService {
  async createBooking(driverId: string, data: CreateBookingInput) {
    // Vehicle Validation
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

    // Parking Validation
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

    const bookingEnabled = parking.bookingModes[data.bookingMode];

    if (!bookingEnabled) {
      throw new ApiError(400, `${data.bookingMode} booking is unavailable.`);
    }
    const slot = await slotAllocatorService.reserveAvailableSlot(
      parking._id.toString(),
      vehicle.vehicleType,
    );

    if (!slot) {
      throw new ApiError(400, "No parking slot available.");
    }
    const pricing = pricingService.calculate(
      parking,
      vehicle.vehicleType,
      data.bookingMode,
    );
    const bookingNumber = bookingNumberService.generate();

    const verificationPin = verificationService.generatePin();

    const qrCode = await qrService.generate(bookingNumber);
    const booking = await bookingRepository.create({
      bookingNumber,

      driverId: vehicle.ownerId,

      ownerId: parking.ownerId,

      parkingId: parking._id,

      slotId: slot._id,

      vehicleId: vehicle._id,

      vehicleType: vehicle.vehicleType,

      bookingMode: data.bookingMode as BookingMode,

      startTime: data.startTime,

      endTime: data.endTime,

      parkingAmount: pricing.parkingAmount,

      ownerCommission: pricing.ownerCommission,

      driverServiceFee: pricing.driverServiceFee,

      ownerReceives: pricing.ownerReceives,

      driverPays: pricing.driverPays,

      paymentStatus: PAYMENT_STATUS.PENDING,

      verificationPin,

      qrCode,

      driverSnapshot: {
        name: "",
        phoneNumber: "",
      },

      parkingSnapshot: {
        parkingName: parking.parkingName,
        address: parking.address,
      },
    });

    const payment = await paymentService.createPayment(booking._id.toString());

    return {
      booking,
      payment,
    };
  }

async verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const result =
    await paymentService.verifyPayment(
      orderId,
      paymentId,
      signature,
    );

  return result;
}

async cancelBooking(
  driverId: string,
  bookingId: string,
  data: unknown,
) {
  return {
    driverId,
    bookingId,
    data,
  };
}

async checkIn(
  ownerId: string,
  bookingId: string,
  data: unknown,
) {
  return {
    ownerId,
    bookingId,
    data,
  };
}

async checkOut(
  ownerId: string,
  bookingId: string,
  data: unknown,
) {
  return {
    ownerId,
    bookingId,
    data,
  };
}

async expireBooking() {
  return null;
}
}

export default new BookingService();
