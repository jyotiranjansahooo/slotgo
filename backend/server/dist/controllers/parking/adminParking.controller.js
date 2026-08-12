import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import parkingService from "../../services/parking/parking.service.js";
export const approveParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.approveParking(req.params.id);
    res.status(200).json(new ApiResponse(200, parking, "Parking approved successfully."));
});
export const rejectParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.rejectParking(req.params.id);
    res.status(200).json(new ApiResponse(200, parking, "Parking rejected successfully."));
});
//# sourceMappingURL=adminParking.controller.js.map