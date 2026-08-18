import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import adminService from "../services/admin/admin.service.js";

// USERS

export const getUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await adminService.getUsers();

    return res.status(200).json(
      new ApiResponse(
        200,
        users,
        "Users fetched successfully.",
      ),
    );
  },
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    const user = await adminService.getUserById(
      userId,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User fetched successfully.",
      ),
    );
  },
);

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new ApiError(
        400,
        "isActive must be a boolean.",
      );
    }

    const user =
      await adminService.updateUserStatus(
        userId,
        isActive,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User status updated successfully.",
      ),
    );
  },
);

// PARKINGS

export const getParkings = asyncHandler(
  async (_req: Request, res: Response) => {
    const parkings =
      await adminService.getParkings();

    return res.status(200).json(
      new ApiResponse(
        200,
        parkings,
        "Parkings fetched successfully.",
      ),
    );
  },
);

export const approveParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId =
      req.params.id as string;

    const parking =
      await adminService.approveParking(
        parkingId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        parking,
        "Parking approved successfully.",
      ),
    );
  },
);

export const rejectParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId =
      req.params.id as string;

    const parking =
      await adminService.rejectParking(
        parkingId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        parking,
        "Parking rejected successfully.",
      ),
    );
  },
);

// BOOKINGS

export const getBookings = asyncHandler(
  async (_req: Request, res: Response) => {
    const bookings =
      await adminService.getBookings();

    return res.status(200).json(
      new ApiResponse(
        200,
        bookings,
        "Bookings fetched successfully.",
      ),
    );
  },
);

export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {
    const bookingId =
      req.params.id as string;

    const booking =
      await adminService.getBookingById(
        bookingId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        booking,
        "Booking fetched successfully.",
      ),
    );
  },
);

export const getParkingBookings =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const parkingId =
        req.params.parkingId as string;

      const bookings =
        await adminService.getParkingBookings(
          parkingId,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          bookings,
          "Parking bookings fetched successfully.",
        ),
      );
    },
  );
// ADMIN DASHBOARD

export const getDashboardStats =
  asyncHandler(
    async (
      _req: Request,
      res: Response,
    ) => {
      const stats =
        await adminService.getDashboardStats();

      return res.status(200).json(
        new ApiResponse(
          200,
          stats,
          "Dashboard statistics fetched successfully.",
        ),
      );
    },
  );
  
// PAYMENTS

export const getPaymentById =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const paymentId =
        req.params.id as string;

      const payment =
        await adminService.getPaymentById(
          paymentId,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          payment,
          "Payment fetched successfully.",
        ),
      );
    },
  );

export const getPaymentByBooking =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const bookingId =
        req.params.bookingId as string;

      const payment =
        await adminService.getPaymentByBooking(
          bookingId,
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          payment,
          "Payment fetched successfully.",
        ),
      );
    },
  );