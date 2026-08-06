import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import { createVehicleService } from "../../services/vehicle/create.service.js";

export const createVehicleController = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicle = await createVehicleService({
      ...req.body,
      ownerId: req.user!._id.toString(),
    });

    res.status(201).json(
      new ApiResponse(
        201,
        "Vehicle added successfully",
        vehicle
      )
    );
  }
);