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

  async findById(id: string) {
    return Booking.findById(id);
  }

  async findByBookingNumber(bookingNumber: string) {
    return Booking.findOne({ bookingNumber });
  }

  async findByVerificationPin(pin: string) {
    return Booking.findOne({
      verificationPin: pin,
    });
  }

  async findByDriver(driverId: string) {
    return Booking.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  async findByParking(parkingId: string) {
    return Booking.find({
      parkingId,
    }).sort({
      createdAt: -1,
    });
  }

  async update(id: string, data: Partial<IBooking>) {
    return Booking.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Booking.findByIdAndDelete(id);
  }
}

export default new BookingRepository();
