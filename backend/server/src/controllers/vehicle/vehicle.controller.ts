import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import vehicleService from "../../services/vehicle/vehicle.service.js";

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.create(
    req.user!._id.toString(),
    req.body
  );

  res.status(201).json(
    new ApiResponse(201, "Vehicle created successfully", vehicle)
  );
});

export const getMyVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getAll(
    req.user!._id.toString()
  );

  res.status(200).json(
    new ApiResponse(200, "Vehicles fetched successfully", vehicles)
  );
});

export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
 const vehicleId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const vehicle = await vehicleService.getById(
  req.user!._id.toString(),
  vehicleId
);

  res.status(200).json(
    new ApiResponse(200, "Vehicle fetched successfully", vehicle)
  );
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
const vehicleId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const vehicle = await vehicleService.update(
  req.user!._id.toString(),
  vehicleId,
  req.body
);

  res.status(200).json(
    new ApiResponse(200, "Vehicle updated successfully", vehicle)
  );
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
const vehicleId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

await vehicleService.delete(
  req.user!._id.toString(),
  vehicleId
);

  res.status(200).json(
    new ApiResponse(200, "Vehicle deleted successfully")
  );
});

export const setDefaultVehicle = asyncHandler(async (req: Request, res: Response) => {
const vehicleId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const vehicle = await vehicleService.setDefault(
  req.user!._id.toString(),
  vehicleId
);

  res.status(200).json(
    new ApiResponse(200, "Default vehicle updated", vehicle)
  );
});