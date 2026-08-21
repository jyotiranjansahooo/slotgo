import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import vehicleService from "../../services/vehicle/vehicle.service.js";

// ==========================================================
// CREATE VEHICLE
// ==========================================================

export const createVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicle = await vehicleService.create(
      req.user!._id.toString(),
      req.body,
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          vehicle,
          "Vehicle created successfully",
        ),
      );
  },
);

// ==========================================================
// GET MY VEHICLES
// ==========================================================

export const getMyVehicles = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicles = await vehicleService.getAll(
      req.user!._id.toString(),
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vehicles,
          "Vehicles fetched successfully",
        ),
      );
  },
);

// ==========================================================
// GET SINGLE VEHICLE
// ==========================================================

export const getVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicleId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const vehicle = await vehicleService.getById(
      req.user!._id.toString(),
      vehicleId,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vehicle,
          "Vehicle fetched successfully",
        ),
      );
  },
);

// ==========================================================
// UPDATE VEHICLE
// ==========================================================

export const updateVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicleId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const vehicle = await vehicleService.update(
      req.user!._id.toString(),
      vehicleId,
      req.body,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vehicle,
          "Vehicle updated successfully",
        ),
      );
  },
);

// ==========================================================
// DELETE VEHICLE
// ==========================================================

export const deleteVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicleId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    await vehicleService.delete(
      req.user!._id.toString(),
      vehicleId,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Vehicle deleted successfully",
        ),
      );
  },
);

// ==========================================================
// SET DEFAULT VEHICLE
// ==========================================================

export const setDefaultVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicleId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const vehicle = await vehicleService.setDefault(
      req.user!._id.toString(),
      vehicleId,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vehicle,
          "Default vehicle updated",
        ),
      );
  },
);