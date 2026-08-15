import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import parkingSlotService from "../services/parkingSlot/parkingSlot.service.js";

type GetParkingSlotsParams = {
  parkingId: string;
};

type DeleteSlotParams = {
  slotId: string;
};

export const createSlot = asyncHandler(async (req: Request, res: Response) => {
  const slot = await parkingSlotService.createSlot(
    req.user!._id.toString(),
    req.body,
  );

  res
    .status(201)
    .json(new ApiResponse(201, slot, "Parking slot created successfully."));
});

export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { parkingId } = req.params;

    const slots = await parkingSlotService.getAvailableSlots(
      parkingId as string,
    );

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

export const getParkingSlots = asyncHandler<GetParkingSlotsParams>(
  async (req, res) => {
    const { parkingId } = req.params;

    const slots = await parkingSlotService.getParkingSlots(parkingId);

    res
      .status(200)
      .json(new ApiResponse(200, slots, "Parking slots fetched successfully."));
  },
);

export const deleteSlot = asyncHandler<DeleteSlotParams>(async (req, res) => {
  const { slotId } = req.params;

  await parkingSlotService.deleteSlot(req.user!._id.toString(), slotId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Parking slot deleted successfully."));
});
