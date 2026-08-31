import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import parkingService from "../../services/parking/parking.service.js";

import { requestParkingActionVerification as requestActionVerification } from "../../services/parking/parkingActionVerification.service.js";
export const createParking = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const parking = await parkingService.createParking(
      req.user!._id.toString(),
      req.body,
      files,
    );

    res
      .status(201)
      .json(new ApiResponse(201, parking, "Parking created successfully."));
  },
);

export const getMyParkings = asyncHandler(
  async (req: Request, res: Response) => {
    const parkings = await parkingService.getMyParkings(
      req.user!._id.toString(),
    );

    res
      .status(200)
      .json(new ApiResponse(200, parkings, "Parkings fetched successfully."));
  },
);

export const getParking = asyncHandler(async (req: Request, res: Response) => {
  const parking = await parkingService.getParkingById(req.params.id as string);

  res
    .status(200)
    .json(new ApiResponse(200, parking, "Parking fetched successfully."));
});

export const updateParking = asyncHandler(
  async (req: Request, res: Response) => {
    const parking = await parkingService.updateParking(
      req.user!._id.toString(),
      req.params.id as string,
      req.body,
    );

    res
      .status(200)
      .json(new ApiResponse(200, parking, "Parking updated successfully."));
  },
);

export const requestParkingActionVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = req.user!._id.toString();
    const parkingId = req.params.id as string;

    const { action } = req.body;

    const result = await requestActionVerification({
      ownerId,
      parkingId,
      action,
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Verification code sent successfully."),
      );
  },
);

export const updateParkingAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const parking = await parkingService.updateParkingAvailability(
      req.user!._id.toString(),

      req.params.id as string,

      {
        isTemporarilyClosed: req.body.isTemporarilyClosed,

        reason: req.body.reason,

        otp: req.body.otp,
      },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        parking,

        req.body.isTemporarilyClosed
          ? "Parking temporarily closed successfully."
          : "Parking reopened successfully.",
      ),
    );
  },
);

/*
|--------------------------------------------------------------------------
| DELETE PARKING
|--------------------------------------------------------------------------
*/

export const deleteParking = asyncHandler(
  async (req: Request, res: Response) => {
    const { otp } = req.body;

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      throw new ApiError(400, "A valid 6-digit verification code is required.");
    }

    await parkingService.deactivateParking(
      req.user!._id.toString(),

      req.params.id as string,

      otp,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Parking deleted successfully."));
  },
);
