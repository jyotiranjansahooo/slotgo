import crypto from "crypto";

import razorpay from "../../config/razorpay.js";

class RazorpayService {
async createOrder(amount: number, receipt: string) {
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
    });

    return order;
  } catch (error: any) {
    console.error("========== RAZORPAY ERROR ==========");
    console.error(error);
    console.error("Status:", error?.statusCode);
    console.error("Code:", error?.error?.code);
    console.error("Description:", error?.error?.description);
    console.error("Reason:", error?.error?.reason);
    console.error("Source:", error?.error?.source);
    console.error("Step:", error?.error?.step);
    throw error;
  }
}

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }

  async refundPayment(paymentId: string, amount?: number) {
    return razorpay.payments.refund(
      paymentId,
      amount !== undefined
        ? {
            amount,
          }
        : {},
    );
  }
}

export default new RazorpayService();
