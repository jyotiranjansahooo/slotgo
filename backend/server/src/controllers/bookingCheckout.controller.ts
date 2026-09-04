import { Request, Response } from "express";
import bookingCheckoutService from "../services/booking/bookingCheckout.service.js";
import { CreateBookingCheckoutInput } from "../validations/booking/checkout.validation.js";

export const createBookingCheckout = async (req: Request, res: Response) => {
  const driverId = req.user!._id.toString();

  const result = await bookingCheckoutService.createCheckout(
    driverId,
    req.body as CreateBookingCheckoutInput,
  );

  res.status(201).json({
    success: true,
    message: "Booking checkout created successfully.",
    data: result,
  });
};

export const getBookingCheckout = async (req: Request, res: Response) => {
  const driverId = req.user!._id.toString();
  const checkoutId = req.params.checkoutId as string;

  const checkout = await bookingCheckoutService.getCheckout(
    driverId,
    checkoutId,
  );

  res.status(200).json({
    success: true,
    message: "Booking checkout retrieved successfully.",
    data: checkout,
  });
};
