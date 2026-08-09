import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import bookingService from "../services/booking/booking.service.js";

type BookingIdParams = {
  bookingId: string;
};

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookingService.createBooking(
      req.user!._id.toString(),
      req.body,
    );

    res
      .status(201)
      .json(new ApiResponse(201, result, "Booking created successfully."));
  },
);

export const cancelBooking = asyncHandler(
  async (req: Request<BookingIdParams>, res: Response) => {
    const result = await bookingService.cancelBooking(
      req.user!._id.toString(),
      req.params.bookingId,
      req.body,
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Booking cancelled successfully."));
  },
);

export const checkIn = asyncHandler(
  async (req: Request<BookingIdParams>, res: Response) => {
    const result = await bookingService.checkIn(
      req.user!._id.toString(),
      req.params.bookingId,
      req.body,
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Driver checked in successfully."));
  },
);

export const checkOut = asyncHandler(
  async (req: Request<BookingIdParams>, res: Response) => {
    const result = await bookingService.checkOut(
      req.user!._id.toString(),
      req.params.bookingId,
      req.body,
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Driver checked out successfully."));
  },
);
