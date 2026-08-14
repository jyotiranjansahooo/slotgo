import Booking, { IBooking } from "../models/Booking.js";
import { ClientSession } from "mongoose";

class BookingRepository {
  async create(data: Partial<IBooking>, session?: ClientSession) {
    if (session) {
      const booking = await Booking.create([data], { session });

      return booking[0];
    }

    return Booking.create(data);
  }
async findAll() {
  return Booking.find().sort({
    createdAt: -1,
  });
}
  async findById(id: string) {
    return Booking.findById(id);
  }

  async findByBookingNumber(bookingNumber: string) {
    return Booking.findOne({
      bookingNumber,
    });
  }

  async findByVerificationPin(pin: string) {
    return Booking.findOne({
      verificationPin: pin,
    });
  }

  // Driver bookings

  async findByDriver(driverId: string) {
    return Booking.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  // Owner bookings

  async findByOwner(ownerId: string) {
    return Booking.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }
  async findOverlappingBooking(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
  ) {
    return Booking.findOne({
      vehicleId,

      bookingStatus: {
        $in: ["pending", "confirmed", "active"],
      },

      startTime: {
        $lt: endTime,
      },

      endTime: {
        $gt: startTime,
      },
    });
  }
  // Parking bookings

  async findByParking(parkingId: string) {
    return Booking.find({
      parkingId,
    }).sort({
      createdAt: -1,
    });
  }

  // Expired pending bookings

  async findExpiredPendingBookings(now: Date) {
    return Booking.find({
      bookingStatus: "pending",
      paymentStatus: "pending",
      endTime: {
        $lte: now,
      },
    });
  }

  // Expired confirmed/active bookings

  async findExpiredConfirmedBookings(now: Date) {
    return Booking.find({
      bookingStatus: {
        $in: ["confirmed", "active"],
      },
      endTime: {
        $lte: now,
      },
    });
  }

  // Update

  async update(id: string, data: Partial<IBooking>) {
    return Booking.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  // Delete

  async delete(id: string) {
    return Booking.findByIdAndDelete(id);
  }
}

export default new BookingRepository();
