import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import parkingService from "../../services/parking/parking.service.js";
export const createParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.createParking(req.user._id.toString(), req.body);
    res
        .status(201)
        .json(new ApiResponse(201, parking, "Parking created successfully."));
});
export const getMyParkings = asyncHandler(async (req, res) => {
    const parkings = await parkingService.getMyParkings(req.user._id.toString());
    res
        .status(200)
        .json(new ApiResponse(200, parkings, "Parkings fetched successfully."));
});
export const getParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.getParkingById(req.params.id);
    res
        .status(200)
        .json(new ApiResponse(200, parking, "Parking fetched successfully."));
});
export const updateParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.updateParking(req.user._id.toString(), req.params.id, req.body);
    res
        .status(200)
        .json(new ApiResponse(200, parking, "Parking updated successfully."));
});
export const deleteParking = asyncHandler(async (req, res) => {
    await parkingService.deactivateParking(req.user._id.toString(), req.params.id);
    res
        .status(200)
        .json(new ApiResponse(200, null, "Parking deactivated successfully."));
});
export const approveParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.approveParking(req.params.id);
    res
        .status(200)
        .json(new ApiResponse(200, parking, "Parking approved successfully."));
});
export const rejectParking = asyncHandler(async (req, res) => {
    const parking = await parkingService.rejectParking(req.params.id);
    res
        .status(200)
        .json(new ApiResponse(200, parking, "Parking rejected successfully."));
});
//# sourceMappingURL=parking.controller.js.map