import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import parkingSlotService from "../services/parkingSlot/parkingSlot.service.js";

// ==========================================================
// CREATE PARKING SLOT
// ==========================================================

export const createSlot = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId = req.params.parkingId as string;

    const slot = await parkingSlotService.createSlot(
      req.user!._id.toString(),
      parkingId,
      req.body,
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          slot,
          "Parking slot created successfully.",
        ),
      );
  },
);

// ==========================================================
// GET AVAILABLE SLOTS
// ==========================================================

export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId = req.params.parkingId as string;

    const slots =
      await parkingSlotService.getAvailableSlots(parkingId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          slots,
          "Available parking slots fetched successfully.",
        ),
      );
  },
);

// ==========================================================
// GET ALL PARKING SLOTS
// ==========================================================

export const getParkingSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId = req.params.parkingId as string;

    const slots =
      await parkingSlotService.getParkingSlots(parkingId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          slots,
          "Parking slots fetched successfully.",
        ),
      );
  },
);

// ==========================================================
// DELETE PARKING SLOT
// ==========================================================

export const deleteSlot = asyncHandler(
  async (req: Request, res: Response) => {
    const slotId = req.params.slotId as string;

    await parkingSlotService.deleteSlot(
      req.user!._id.toString(),
      slotId,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Parking slot deleted successfully.",
        ),
      );
  },
);