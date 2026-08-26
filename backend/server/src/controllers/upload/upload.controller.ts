import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import uploadService from "../../services/upload/upload.service.js";

export const uploadParkingImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(
        400,
        "Please select a parking image.",
      );
    }

    const image = await uploadService.uploadParkingImage(
      req.file,
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          image,
          "Parking image uploaded successfully.",
        ),
      );
  },
);

export const deleteParkingImage = asyncHandler(
  async (req: Request, res: Response) => {
    const { publicId } = req.body as {
      publicId?: string;
    };

    if (!publicId) {
      throw new ApiError(400, "Image public ID is required.");
    }

    await uploadService.deleteImage(publicId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Parking image deleted successfully.",
        ),
      );
  },
);