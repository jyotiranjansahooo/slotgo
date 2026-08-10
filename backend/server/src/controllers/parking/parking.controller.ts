import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import parkingService from "../../services/parking/parking.service.js";

export const createParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parking = await parkingService.createParking(
      req.user!._id.toString(),
      req.body,
    );

    res.status(201).json(
      new ApiResponse(
        201,
        parking,
        "Parking created successfully.",
      ),
    );
  },
);

export const getMyParkings = asyncHandler(
  async (req: Request, res: Response) => {
    const parkings = await parkingService.getMyParkings(
      req.user!._id.toString(),
    );

    res.status(200).json(
      new ApiResponse(
        200,
        parkings,
        "Parkings fetched successfully.",
      ),
    );
  },
);

export const getParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parking = await parkingService.getParkingById(
      req.params.id as string,
    );

    res.status(200).json(
      new ApiResponse(
        200,
        parking,
        "Parking fetched successfully.",
      ),
    );
  },
);

export const deleteParking = asyncHandler(
  async (req: Request, res: Response) => {
    await parkingService.deactivateParking(
      req.user!._id.toString(),
      req.params.id as string,
    );

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Parking deactivated successfully.",
      ),
    );
  },
);