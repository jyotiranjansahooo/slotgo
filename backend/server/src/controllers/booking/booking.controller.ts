import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import bookingService from "../../services/booking/booking.service.js";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookingService.createBooking(
      req.user!._id.toString(),
      req.body,
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          result,
          "Booking created successfully.",
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
      await bookingService.verifyPayment(
        orderId,
        paymentId,
        signature,
      );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Payment verified and booking confirmed.",
        ),
      );
  },
);