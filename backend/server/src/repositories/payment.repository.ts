import Payment, { IPayment } from "../models/Payment.js";

class PaymentRepository {
  async create(data: Partial<IPayment>) {
    return Payment.create(data);
  }

  async findById(id: string) {
    return Payment.findById(id);
  }

  async findByBookingId(bookingId: string) {
    return Payment.findOne({
      bookingId,
    });
  }

  async findByOrderId(orderId: string) {
    return Payment.findOne({
      orderId,
    });
  }

  async findByPaymentId(paymentId: string) {
    return Payment.findOne({
      paymentId,
    });
  }

  async update(
    id: string,
    data: Partial<IPayment>,
  ) {
    return Payment.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );
  }

  async updateStatus(
    id: string,
    status: IPayment["status"],
  ) {
    return Payment.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );
  }
}

export default new PaymentRepository();