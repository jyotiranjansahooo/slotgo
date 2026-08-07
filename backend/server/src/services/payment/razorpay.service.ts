import crypto from "crypto";

import razorpay from "../../config/razorpay.js";

class RazorpayService {
  async createOrder(
    amount: number,
    receipt: string,
  ) {
    return razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
    });
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    const body =
      `${orderId}|${paymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET!,
        )
        .update(body)
        .digest("hex");

    return (
      expectedSignature === signature
    );
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
  ) {
    return razorpay.payments.refund(
      paymentId,
      amount
        ? {
            amount,
          }
        : {},
    );
  }
}

export default new RazorpayService();