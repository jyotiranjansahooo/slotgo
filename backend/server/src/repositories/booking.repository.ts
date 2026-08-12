import Booking, { IBooking } from "../models/Booking.js";
import { ClientSession } from "mongoose";

class BookingRepository {
  async create(
    data: Partial<IBooking>,
    session?: ClientSession,
  ) {
    if (session) {
      const booking = await Booking.create(
        [data],
        { session },
      );

      return booking[0];
    }

    return Booking.create(data);
  }

  async findById(id: string) {
    return Booking.findById(id);
  }

  async findByBookingNumber(
    bookingNumber: string,
  ) {
    return Booking.findOne({
      bookingNumber,
    });
  }

  async findByVerificationPin(
    pin: string,
  ) {
    return Booking.findOne({
      verificationPin: pin,
    });
  }

  // ----------------------------------------------------------
  // Driver bookings
  // ----------------------------------------------------------

  async findByDriver(
    driverId: string,
  ) {
    return Booking.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  // ----------------------------------------------------------
  // Owner bookings
  // ----------------------------------------------------------

  async findByOwner(
    ownerId: string,
  ) {
    return Booking.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }

  // ----------------------------------------------------------
  // Parking bookings
  // ----------------------------------------------------------

  async findByParking(
    parkingId: string,
  ) {
    return Booking.find({
      parkingId,
    }).sort({
      createdAt: -1,
    });
  }

  // ----------------------------------------------------------
  // Expired pending bookings
  // ----------------------------------------------------------

  async findExpiredPendingBookings(
    now: Date,
  ) {
    return Booking.find({
      bookingStatus: "pending",
      paymentStatus: "pending",
      endTime: {
        $lte: now,
      },
    });
  }

  // ----------------------------------------------------------
  // Expired confirmed/active bookings
  // ----------------------------------------------------------

  async findExpiredConfirmedBookings(
    now: Date,
  ) {
    return Booking.find({
      bookingStatus: {
        $in: [
          "confirmed",
          "active",
        ],
      },
      endTime: {
        $lte: now,
      },
    });
  }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  async update(
    id: string,
    data: Partial<IBooking>,
  ) {
    return Booking.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );
  }

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  async delete(id: string) {
    return Booking.findByIdAndDelete(id);
  }
}

export default new BookingRepository();