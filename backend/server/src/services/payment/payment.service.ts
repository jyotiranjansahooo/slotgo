import ApiError from "../../utils/ApiError.js";

import walletService from "../wallet/wallet.service.js";
import slotAllocatorService from "../parkingSlot/slotAllocator.service.js";
import razorpayService from "./razorpay.service.js";

import bookingRepository from "../../repositories/booking.repository.js";
import paymentRepository from "../../repositories/payment.repository.js";

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
  // ============================================================
  // CREATE PAYMENT
  // ============================================================

  async createPayment(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE PAYMENT RECORDS
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // VALIDATE BOOKING STATE
    // ----------------------------------------------------------

    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
      throw new ApiError(400, "Booking has already been paid.");
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, "Cancelled booking cannot be paid.");
    }

    if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
      throw new ApiError(400, "Completed booking cannot be paid.");
    }

    // ----------------------------------------------------------
    // CALCULATE PAYMENT AMOUNT
    // ----------------------------------------------------------

    const amountInPaise = Math.round(booking.driverPays * 100);

    if (amountInPaise <= 0) {
      throw new ApiError(400, "Invalid payment amount.");
    }

    // ----------------------------------------------------------
    // CREATE RAZORPAY ORDER
    // ----------------------------------------------------------

    const razorpayOrder = await razorpayService.createOrder(
      amountInPaise,
      booking.bookingNumber,
    );

    // ----------------------------------------------------------
    // CREATE PAYMENT RECORD
    // ----------------------------------------------------------

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

  // ============================================================
  // VERIFY PAYMENT
  // ============================================================

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      throw new ApiError(404, "Payment record not found.");
    }

    // ==========================================================
    // ALREADY SUCCESSFUL
    // ==========================================================

    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      const booking = await bookingRepository.findById(
        payment.bookingId.toString(),
      );

      if (!booking) {
        throw new ApiError(404, "Booking not found.");
      }

      // --------------------------------------------------------
      // ENSURE BOOKING IS CONFIRMED
      // --------------------------------------------------------

      let updatedBooking = booking;

      if (
        booking.bookingStatus === BOOKING_STATUS.PENDING ||
        booking.paymentStatus !== BOOKING_PAYMENT_STATUS.PAID
      ) {
        const confirmedSlot = await slotAllocatorService.confirmReservation(
          booking.slotId.toString(),
        );

        if (!confirmedSlot) {
          throw new ApiError(
            500,
            "Unable to confirm parking slot reservation.",
          );
        }

        const result = await bookingRepository.update(booking._id.toString(), {
          paymentStatus: BOOKING_PAYMENT_STATUS.PAID,

          bookingStatus: BOOKING_STATUS.CONFIRMED,
        });

        if (!result) {
          throw new ApiError(
            500,
            "Payment succeeded but booking could not be confirmed.",
          );
        }

        updatedBooking = result;
      }

      // --------------------------------------------------------
      // CREDIT OWNER
      //
      // The wallet service uses referenceId to prevent
      // duplicate credit for the same booking.
      // --------------------------------------------------------

      const walletResult = await walletService.creditOwnerEarnings(
        updatedBooking.ownerId.toString(),

        updatedBooking.ownerReceives,

        updatedBooking._id.toString(),

        `booking:${updatedBooking._id.toString()}`,

        `Earnings from booking ${updatedBooking.bookingNumber}`,
      );

      return {
        payment,

        booking: updatedBooking,

        wallet: walletResult.wallet,

        transaction: walletResult.transaction,
      };
    }

    // ==========================================================
    // VERIFY RAZORPAY SIGNATURE
    // ==========================================================

    const isValid = razorpayService.verifySignature(
      orderId,
      paymentId,
      signature,
    );

    if (!isValid) {
      await paymentRepository.update(payment._id.toString(), {
        status: PAYMENT_STATUS.FAILED,
      });

      throw new ApiError(400, "Invalid payment signature.");
    }

    // ==========================================================
    // UPDATE PAYMENT
    // ==========================================================

    const updatedPayment = await paymentRepository.update(
      payment._id.toString(),
      {
        paymentId,

        signature,

        status: PAYMENT_STATUS.SUCCESS,

        paidAt: new Date(),
      },
    );

    if (!updatedPayment) {
      throw new ApiError(500, "Unable to update payment.");
    }

    // ==========================================================
    // GET BOOKING
    // ==========================================================

    const booking = await bookingRepository.findById(
      payment.bookingId.toString(),
    );

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // ==========================================================
    // CONFIRM SLOT
    // ==========================================================

    const confirmedSlot = await slotAllocatorService.confirmReservation(
      booking.slotId.toString(),
    );

    if (!confirmedSlot) {
      throw new ApiError(500, "Unable to confirm parking slot reservation.");
    }

    // ==========================================================
    // CONFIRM BOOKING
    // ==========================================================

    const updatedBooking = await bookingRepository.update(
      booking._id.toString(),
      {
        paymentStatus: BOOKING_PAYMENT_STATUS.PAID,

        bookingStatus: BOOKING_STATUS.CONFIRMED,
      },
    );

    if (!updatedBooking) {
      throw new ApiError(
        500,
        "Payment succeeded but booking could not be confirmed.",
      );
    }

    // ==========================================================
    // CREDIT OWNER WALLET
    // ==========================================================

    const walletResult = await walletService.creditOwnerEarnings(
      updatedBooking.ownerId.toString(),

      updatedBooking.ownerReceives,

      updatedBooking._id.toString(),

      `booking:${updatedBooking._id.toString()}`,

      `Earnings from booking ${updatedBooking.bookingNumber}`,
    );

    // ==========================================================
    // RETURN
    // ==========================================================

    return {
      payment: updatedPayment,

      booking: updatedBooking,

      wallet: walletResult.wallet,

      transaction: walletResult.transaction,
    };
  }

  // ============================================================
  // REFUND PAYMENT
  // ============================================================

  async refundPayment(paymentId: string, amount?: number) {
    // ----------------------------------------------------------
    // FIND PAYMENT
    // ----------------------------------------------------------

    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    // ----------------------------------------------------------
    // PAYMENT MUST BE SUCCESSFUL
    // ----------------------------------------------------------

    if (payment.status !== PAYMENT_STATUS.SUCCESS) {
      throw new ApiError(400, "Only successful payments can be refunded.");
    }

    // ----------------------------------------------------------
    // FIND BOOKING
    // ----------------------------------------------------------

    const booking = await bookingRepository.findById(
      payment.bookingId.toString(),
    );

    if (!booking) {
      throw new ApiError(404, "Booking not found.");
    }

    // ----------------------------------------------------------
    // CALCULATE REFUNDABLE AMOUNT
    // ----------------------------------------------------------

    const refundableAmount = payment.amount - payment.refundAmount;

    const refundAmount = amount ?? refundableAmount;

    if (refundAmount <= 0) {
      throw new ApiError(400, "Refund amount must be greater than zero.");
    }

    if (refundAmount > refundableAmount) {
      throw new ApiError(400, "Refund amount exceeds the refundable amount.");
    }

    // ----------------------------------------------------------
    // PAYMENT ID REQUIRED
    // ----------------------------------------------------------

    if (!payment.paymentId) {
      throw new ApiError(400, "Payment transaction ID is missing.");
    }

    // ----------------------------------------------------------
    // PROCESS RAZORPAY REFUND
    // ----------------------------------------------------------

    const refund = await razorpayService.refundPayment(
      payment.paymentId,

      Math.round(refundAmount * 100),
    );

    // ----------------------------------------------------------
    // CALCULATE TOTAL REFUNDED
    // ----------------------------------------------------------

    const totalRefunded = payment.refundAmount + refundAmount;

    const fullyRefunded = totalRefunded >= payment.amount;

    // ----------------------------------------------------------
    // UPDATE PAYMENT
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // CALCULATE OWNER EARNING REVERSAL
    // ----------------------------------------------------------

    const ownerRefundAmount = Number(
      (booking.ownerReceives * (refundAmount / payment.amount)).toFixed(2),
    );

    // ----------------------------------------------------------
    // REVERSE OWNER WALLET
    // ----------------------------------------------------------

    let walletResult: {
      wallet: unknown;
      transaction: unknown;
    } | null = null;

    if (ownerRefundAmount > 0) {
      walletResult = await walletService.reverseOwnerEarnings(
        booking.ownerId.toString(),

        ownerRefundAmount,

        booking._id.toString(),

        `refund:${refund.id}`,

        `Owner earning reversal for booking ${booking.bookingNumber}`,
      );
    }

    // ----------------------------------------------------------
    // RETURN REFUND RESULT
    // ----------------------------------------------------------

    return {
      payment: updatedPayment,

      refund,

      wallet: walletResult?.wallet ?? null,

      transaction: walletResult?.transaction ?? null,
    };
  }
}

export default new PaymentService();
