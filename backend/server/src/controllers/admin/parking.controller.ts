import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import parkingRepository from "../../repositories/parking.repository.js";

export const getAllParkings = asyncHandler(
  async (_req: Request, res: Response) => {
    const parkings =
      await parkingRepository.findAll();

    res.status(200).json(
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
    const { id } = req.params;

    const parking =
      await parkingRepository.findById(
        id as string,
      );

    if (!parking) {
      throw new ApiError(
        404,
        "Parking not found.",
      );
    }

    const updatedParking =
      await parkingRepository.approve(
        id as string,
      );

    if (!updatedParking) {
      throw new ApiError(
        500,
        "Unable to approve parking.",
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        updatedParking,
        "Parking approved successfully.",
      ),
    );
  },
);

export const rejectParking = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const parking =
      await parkingRepository.findById(
        id as string,
      );

    if (!parking) {
      throw new ApiError(
        404,
        "Parking not found.",
      );
    }

    const updatedParking =
      await parkingRepository.reject(
        id as string,
      );

    if (!updatedParking) {
      throw new ApiError(
        500,
        "Unable to reject parking.",
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        updatedParking,
        "Parking rejected successfully.",
      ),
    );
  },
);