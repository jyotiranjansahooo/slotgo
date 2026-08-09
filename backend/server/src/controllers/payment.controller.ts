import { Request, Response } from "express";
import { createPaymentSchema } from "../validations/payment/create.validation.js";
import { refundPaymentSchema } from "../validations/payment/refund.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import paymentService from "../services/payment/payment.service.js";

import { verifyPaymentSchema } from "../validations/payment/verify.validation.js";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      createPaymentSchema.parse(
        req.body,
      );

    const result =
      await paymentService.createPayment(
        data.bookingId,
      );

    res.status(201).json(
      new ApiResponse(
        201,
        result,
        "Payment order created successfully.",
      ),
    );
  },
);

export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const data = verifyPaymentSchema.parse(req.body);

    const result = await paymentService.verifyPayment(
      data.orderId,
      data.paymentId,
      data.signature,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Payment verified successfully.", result));
  },
);

export const refundPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      refundPaymentSchema.parse(
        req.body,
      );

    const result =
      await paymentService.refundPayment(
        data.paymentId,
        data.amount,
      );

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Refund initiated successfully.",
      ),
    );
  },
);
