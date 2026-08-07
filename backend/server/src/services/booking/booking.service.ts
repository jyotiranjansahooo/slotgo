import mongoose from "mongoose";

import ApiError from "../../utils/ApiError.js";

import bookingRepository from "../../repositories/booking.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
// import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";
// import paymentRepository from "../../repositories/payment.repository.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import { CreateBookingInput } from "../../validations/booking/create.validation.js";

class BookingService {

async createBooking(
  driverId: string,
  data: CreateBookingInput,
) {

  /* Check Vehicle */

  const vehicle =
    await vehicleRepository.findById(
      data.vehicleId,
    );

  if (!vehicle) {
    throw new ApiError(
      404,
      "Vehicle not found.",
    );
  }
  /* Check Vehicle Owner */

if (vehicle.ownerId.toString() !== driverId) {
 /* Check Vehicle Status */

if (!vehicle.isActive) {
  throw new ApiError(
    400,
    "Vehicle is inactive.",
  );
}
/* Check Parking */

const parking =
  await parkingRepository.findById(
    data.parkingId,
  );

if (!parking) {
  throw new ApiError(
    404,
    "Parking not found.",
  );
}
/* Check Parking Approval */

if (parking.status !== "approved") {
 /* Check Parking Status */

if (!parking.isActive) {
 /* Check Booking Mode */

const bookingEnabled =
  parking.bookingModes[
    data.bookingMode
  ];

if (!bookingEnabled) {
 /* Reserve Slot */

const slot =
  await slotAllocatorService.reserveAvailableSlot(
    parking._id.toString(),

    vehicle.vehicleType,
  );
  throw new ApiError(
    400,
    `${data.bookingMode} booking is not available for this parking.`,
  );
}
  throw new ApiError(
    400,
    "Parking is currently inactive.",
  );
}
  throw new ApiError(
    400,
    "Parking is not approved.",
  );
}
  throw new ApiError(
    403,
    "This vehicle doesn't belong to you.",
  );
}

}

  async verifyPayment() {

  }

  async cancelBooking() {

  }

  async checkIn() {

  }

  async checkOut() {

  }

  async expireBooking() {

  }

}

export default new BookingService();