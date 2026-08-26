import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload.js";

export const uploadParkingImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new ApiError(400, "Please select at least one image.");
    }

    if (files.length > 5) {
      throw new ApiError(400, "Maximum 5 images are allowed.");
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const result = await uploadImageToCloudinary(
          file.buffer,
          "parking-images",
        );

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          uploadedImages,
          "Parking images uploaded successfully.",
        ),
      );
  },
);