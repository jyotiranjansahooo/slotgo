import { Request, Response } from "express";

import { VehicleType } from "../../constants/vehicle.js";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import parkingDiscoveryService from "../../services/parking/parkingDiscovery.service.js";


// GET AVAILABLE SLOTS BY VEHICLE TYPE


export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { vehicleType } = req.query;

    if (typeof vehicleType !== "string") {
      return res.status(400).json(
        new ApiResponse(
          400,
          null,
          "vehicleType query parameter is required.",
        ),
      );
    }

    const result =
      await parkingDiscoveryService.getAvailableSlots(
        id as string,
        vehicleType as VehicleType,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Available parking slots fetched successfully.",
      ),
    );
  },
);


// GET ALL APPROVED PARKINGS


export const getApprovedParkings = asyncHandler(
  async (_req: Request, res: Response) => {
    const parkings =
      await parkingDiscoveryService.getApprovedParkings();

    return res.status(200).json(
      new ApiResponse(
        200,
        parkings,
        "Parkings fetched successfully.",
      ),
    );
  },
);


// SEARCH PARKINGS


export const searchParkings = asyncHandler(
  async (req: Request, res: Response) => {
    const { city, parkingType } = req.query;

    const parkings =
      await parkingDiscoveryService.searchParkings({
        city:
          typeof city === "string"
            ? city
            : undefined,

        parkingType:
          typeof parkingType === "string"
            ? parkingType
            : undefined,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        parkings,
        "Parkings fetched successfully.",
      ),
    );
  },
);


// GET PARKING DETAILS


export const getParkingDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result =
      await parkingDiscoveryService.getParkingDetails(
        id as string,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Parking details fetched successfully.",
      ),
    );
  },
);