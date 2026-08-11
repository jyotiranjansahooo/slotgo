import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import parkingService from "../../services/parking/parking.service.js";

export const approveParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parking =
      await parkingService.approveParking(
        req.params.id as string,
      );

    res.status(200).json(
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
    const parking =
      await parkingService.rejectParking(
        req.params.id as string,
      );

    res.status(200).json(
      new ApiResponse(
        200,
        parking,
        "Parking rejected successfully.",
      ),
    );
  },
);