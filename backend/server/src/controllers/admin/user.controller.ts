import {
  Request,
  Response,
} from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

import userRepository from "../../repositories/user.repository.js";

export const getAllUsers = asyncHandler(
  async (
    _req: Request,
    res: Response,
  ) => {
    const users =
      await userRepository.findAll();

    res.status(200).json(
      new ApiResponse(
        200,
        users,
        "Users fetched successfully.",
      ),
    );
  },
);

export const getUser = asyncHandler(
  async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.params;

    const user =
      await userRepository.findByIdForAdmin(
        id as string,
      );

    if (!user) {
      throw new ApiError(
        404,
        "User not found.",
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User fetched successfully.",
      ),
    );
  },
);

export const updateUserStatus =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const { id } = req.params;

      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        throw new ApiError(
          400,
          "isActive must be a boolean.",
        );
      }

      // Prevent admin from accidentally
      // disabling their own account.
      if (
        req.user!._id.toString() === id
        && !isActive
      ) {
        throw new ApiError(
          400,
          "You cannot deactivate your own admin account.",
        );
      }

      const existingUser =
        await userRepository.findByIdForAdmin(
          id as string,
        );

      if (!existingUser) {
        throw new ApiError(
          404,
          "User not found.",
        );
      }

      const updatedUser =
        await userRepository.updateStatus(
          id as string,
          isActive,
        );

      if (!updatedUser) {
        throw new ApiError(
          500,
          "Unable to update user status.",
        );
      }

      res.status(200).json(
        new ApiResponse(
          200,
          updatedUser,
          isActive
            ? "User activated successfully."
            : "User deactivated successfully.",
        ),
      );
    },
  );