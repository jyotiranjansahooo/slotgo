import BookingCheckout, {
  IBookingCheckout,
} from "../models/BookingCheckout.js";

class BookingCheckoutRepository {
  async create(data: Partial<IBookingCheckout>) {
    return BookingCheckout.create(data);
  }

  async findById(id: string) {
    return BookingCheckout.findById(id);
  }

  async findByOrderId(orderId: string) {
    return BookingCheckout.findOne({
      orderId,
    });
  }

  async findByDriver(driverId: string) {
    return BookingCheckout.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  async delete(id: string) {
    return BookingCheckout.findByIdAndDelete(id);
  }

  async deleteByOrderId(orderId: string) {
    return BookingCheckout.findOneAndDelete({
      orderId,
    });
  }

  async findExpired(now: Date) {
    return BookingCheckout.find({
      expiresAt: {
        $lte: now,
      },
    });
  }
}

export default new BookingCheckoutRepository();