import ApiError from "../../utils/ApiError.js";

import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

import razorpayService from "./razorpay.service.js";
import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";

import {
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  REFUND_STATUS,
} from "../../constants/payment.js";

import {
  BOOKING_STATUS,
  PAYMENT_STATUS as BOOKING_PAYMENT_STATUS,
} from "../../constants/booking.js";

class PaymentService {
  async createPayment(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }
    await slotAllocatorService.confirmReservation(booking.slotId.toString());
    // Prevent creating duplicate payment orders
    const existingPayment = await paymentRepository.findByBookingId(bookingId);

    if (existingPayment) {
      return {
        booking,
        payment: existingPayment,
        razorpayOrder: {
          id: existingPayment.orderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
        },
      };
    }

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(booking.driverPays * 100);

    const razorpayOrder = await razorpayService.createOrder(
      amountInPaise,
      booking.bookingNumber,
    );

    const payment = await paymentRepository.create({
      bookingId: booking._id,

      driverId: booking.driverId,

      ownerId: booking.ownerId,

      gateway: PAYMENT_GATEWAY.RAZORPAY,

      orderId: razorpayOrder.id,

      amount: booking.driverPays,

      currency: "INR",

      status: PAYMENT_STATUS.CREATED,

      refundAmount: 0,

      refundStatus: REFUND_STATUS.NONE,
    });

    return {
      booking,
      payment,
      razorpayOrder,
    };
  }

 async verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const payment =
    await paymentRepository.findByOrderId(
      orderId,
    );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment record not found.",
    );
  }

  
  // Already processed
  

if (
  payment.status ===
  PAYMENT_STATUS.SUCCESS
) {
  const booking =
    await bookingRepository.findById(
      payment.bookingId.toString(),
    );

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found.",
    );
  }

  if (
    booking.bookingStatus ===
      BOOKING_STATUS.PENDING ||
    booking.paymentStatus !==
      BOOKING_PAYMENT_STATUS.PAID
  ) {
    await slotAllocatorService.confirmReservation(
      booking.slotId.toString(),
    );

    const updatedBooking =
      await bookingRepository.update(
        booking._id.toString(),
        {
          paymentStatus:
            BOOKING_PAYMENT_STATUS.PAID,

          bookingStatus:
            BOOKING_STATUS.CONFIRMED,
        },
      );

    return {
      payment,
      booking:
        updatedBooking ?? booking,
    };
  }

  return {
    payment,
    booking,
  };
}

  
  // Verify Razorpay signature
  

  const isValid =
    razorpayService.verifySignature(
      orderId,
      paymentId,
      signature,
    );

  if (!isValid) {
    await paymentRepository.update(
      payment._id.toString(),
      {
        status:
          PAYMENT_STATUS.FAILED,
      },
    );

    throw new ApiError(
      400,
      "Invalid payment signature.",
    );
  }

  
  // Update payment
  

  const updatedPayment =
    await paymentRepository.update(
      payment._id.toString(),
      {
        paymentId,
        signature,
        status:
          PAYMENT_STATUS.SUCCESS,
        paidAt: new Date(),
      },
    );

  if (!updatedPayment) {
    throw new ApiError(
      500,
      "Unable to update payment.",
    );
  }

  
  // Get booking
  

  const booking =
    await bookingRepository.findById(
      payment.bookingId.toString(),
    );

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found.",
    );
  }

  
  // Confirm slot reservation
  

  await slotAllocatorService.confirmReservation(
    booking.slotId.toString(),
  );

  
  // Confirm booking
  

  const updatedBooking =
    await bookingRepository.update(
      booking._id.toString(),
      {
        paymentStatus:
          BOOKING_PAYMENT_STATUS.PAID,

        bookingStatus:
          BOOKING_STATUS.CONFIRMED,
      },
    );

  if (!updatedBooking) {
    throw new ApiError(
      500,
      "Payment succeeded but booking could not be confirmed.",
    );
  }

  return {
    payment: updatedPayment,
    booking: updatedBooking,
  };
}

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    if (payment.status !== PAYMENT_STATUS.SUCCESS) {
      throw new ApiError(400, "Only successful payments can be refunded.");
    }

    const refundableAmount = payment.amount - payment.refundAmount;

    const refundAmount = amount ?? refundableAmount;

    if (refundAmount <= 0) {
      throw new ApiError(400, "Refund amount must be greater than zero.");
    }

    if (refundAmount > refundableAmount) {
      throw new ApiError(400, "Refund amount exceeds the refundable amount.");
    }

    if (!payment.paymentId) {
      throw new ApiError(400, "Payment transaction ID is missing.");
    }

    const refund = await razorpayService.refundPayment(
      payment.paymentId,
      Math.round(refundAmount * 100),
    );

    const totalRefunded = payment.refundAmount + refundAmount;

    const fullyRefunded = totalRefunded >= payment.amount;

    const updatedPayment = await paymentRepository.update(
      payment._id.toString(),
      {
        refundId: refund.id,

        refundAmount: totalRefunded,

        refundStatus: REFUND_STATUS.SUCCESS,

        status: fullyRefunded
          ? PAYMENT_STATUS.REFUNDED
          : PAYMENT_STATUS.PARTIALLY_REFUNDED,

        refundedAt: fullyRefunded ? new Date() : undefined,
      },
    );

    if (!updatedPayment) {
      throw new ApiError(500, "Unable to update refund information.");
    }

    return {
      payment: updatedPayment,
      refund,
    };
  }
}

export default new PaymentService();
