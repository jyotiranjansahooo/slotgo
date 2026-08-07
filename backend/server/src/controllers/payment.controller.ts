import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";

import paymentService from "../services/payment/payment.service.js";

import ApiResponse from "../utils/ApiResponse.js";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    const result =
      await paymentService.createPayment(
        bookingId,
      );

    return res.status(201).json(
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
    const {
      orderId,
      paymentId,
      signature,
    } = req.body;

    const result =
      await paymentService.verifyPayment(
        orderId,
        paymentId,
        signature,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Payment verified successfully.",
      ),
    );
  },
);

export const refundPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      paymentId,
      amount,
    } = req.body;

    const result =
      await paymentService.refundPayment(
        paymentId,
        amount,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Refund initiated successfully.",
      ),
    );
  },
);