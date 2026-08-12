import {
  Request,
  Response,
} from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import dashboardService from "../../services/admin/dashboard.service.js";

export const getDashboard =
  asyncHandler(
    async (
      _req: Request,
      res: Response,
    ) => {
      const dashboard =
        await dashboardService.getDashboard();

      res.status(200).json(
        new ApiResponse(
          200,
          dashboard,
          "Dashboard data fetched successfully.",
        ),
      );
    },
  );