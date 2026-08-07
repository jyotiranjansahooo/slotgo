import ApiError from "../../utils/ApiError.js";
import { PAYMENT_STATUS } from "../../constants/payment.js";
import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";
import { BOOKING_STATUS } from "../../constants/booking.js";

import razorpayService from "./razorpay.service.js";

class PaymentService {
  async createPayment(
    bookingId: string,
  ) {
    const booking =
      await bookingRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found.",
      );
    }

    if (booking.paymentStatus === "paid") {
      throw new ApiError(
        400,
        "Booking is already paid.",
      );
    }

    const order =
      await razorpayService.createOrder(
        Math.round(
          booking.driverPays * 100,
        ),
        booking.bookingNumber,
      );

    const payment =
      await paymentRepository.create({
        bookingId: booking._id,
        driverId: booking.driverId,
        ownerId: booking.ownerId,
        orderId: order.id,
        amount: booking.driverPays,
        currency: order.currency,
      });

    return {
      booking,
      payment,
      razorpayOrder: order,
    };
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    const valid =
      razorpayService.verifySignature(
        orderId,
        paymentId,
        signature,
      );

    if (!valid) {
      throw new ApiError(
        400,
        "Invalid payment signature.",
      );
    }

    const payment =
      await paymentRepository.findByOrderId(
        orderId,
      );

    if (!payment) {
      throw new ApiError(
        404,
        "Payment not found.",
      );
    }

    await paymentRepository.update(
      payment._id.toString(),
      {
        paymentId,
        signature,
        status: PAYMENT_STATUS.SUCCESS,
        paidAt: new Date(),
      },
    );

    await bookingRepository.update(
      payment.bookingId.toString(),
      {
        paymentStatus: "paid",
       bookingStatus: BOOKING_STATUS.CONFIRMED,
      },
    );

    return {
      success: true,
      message:
        "Payment verified successfully.",
    };
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
  ) {
    return razorpayService.refundPayment(
      paymentId,
      amount
        ? Math.round(amount * 100)
        : undefined,
    );
  }
}

export default new PaymentService();