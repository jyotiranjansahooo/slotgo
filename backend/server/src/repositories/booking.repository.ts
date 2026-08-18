import Booking, { IBooking } from "../models/Booking.js";
import { ClientSession } from "mongoose";

class BookingRepository {
  // CREATE

  async create(data: Partial<IBooking>, session?: ClientSession) {
    if (session) {
      const booking = await Booking.create([data], { session });

      return booking[0];
    }

    return Booking.create(data);
  }

  // FIND ALL

  async findAll() {
    return Booking.find().sort({
      createdAt: -1,
    });
  }

  // FIND BY ID

  async findById(id: string) {
    return Booking.findById(id);
  }

  // FIND BY BOOKING NUMBER

  async findByBookingNumber(bookingNumber: string) {
    return Booking.findOne({
      bookingNumber,
    });
  }
  async findByOvertimeOrderId(orderId: string) {
  return Booking.findOne({
    overtimePaymentOrderId: orderId,
  });
}

  // FIND BY VERIFICATION PIN

  async findByVerificationPin(pin: string) {
    return Booking.findOne({
      verificationPin: pin,
    });
  }

  // FIND BY OVERTIME RAZORPAY ORDER ID

  async findOneByOvertimeOrderId(orderId: string) {
    return Booking.findOne({
      overtimePaymentOrderId: orderId,
    });
  }

  // DRIVER BOOKINGS

  async findByDriver(driverId: string) {
    return Booking.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  // OWNER BOOKINGS

  async findByOwner(ownerId: string) {
    return Booking.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }

  // FIND OVERLAPPING VEHICLE BOOKING

  async findOverlappingBooking(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const now = new Date();

    return Booking.findOne({
      vehicleId,

      startTime: {
        $lt: endTime,
      },

      endTime: {
        $gt: startTime,
      },

      $or: [
        // ------------------------------------------------------
        // CONFIRMED / ACTIVE BOOKINGS
        // These always block the vehicle.
        // ------------------------------------------------------

        {
          bookingStatus: {
            $in: ["confirmed", "active"],
          },
        },

        // ------------------------------------------------------
        // PENDING PAYMENT
        //
        // A pending booking only blocks the vehicle if its
        // booking window has not expired.
        // ------------------------------------------------------

        {
          bookingStatus: "pending",

          paymentStatus: "pending",

          endTime: {
            $gt: now,
          },
        },
      ],
    });
  }

  // PARKING BOOKINGS

  async findByParking(parkingId: string) {
    return Booking.find({
      parkingId,
    }).sort({
      createdAt: -1,
    });
  }

  // EXPIRED PENDING BOOKINGS

  async findExpiredPendingBookings(now: Date) {
    return Booking.find({
      bookingStatus: "pending",

      paymentStatus: "pending",

      endTime: {
        $lte: now,
      },
    });
  }

  // EXPIRED CONFIRMED / ACTIVE BOOKINGS

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

  // UPDATE

  async update(id: string, data: Partial<IBooking>) {
    return Booking.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  // DELETE

  async delete(id: string) {
    return Booking.findByIdAndDelete(id);
  }
}

export default new BookingRepository();
