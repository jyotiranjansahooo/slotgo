import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
export const getAllParkings = asyncHandler(async (_req, res) => {
    const parkings = await parkingRepository.findAll();
    res.status(200).json(new ApiResponse(200, parkings, "Parkings fetched successfully."));
});
export const approveParking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parking = await parkingRepository.findById(id);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const updatedParking = await parkingRepository.approve(id);
    if (!updatedParking) {
        throw new ApiError(500, "Unable to approve parking.");
    }
    res.status(200).json(new ApiResponse(200, updatedParking, "Parking approved successfully."));
});
export const rejectParking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parking = await parkingRepository.findById(id);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const updatedParking = await parkingRepository.reject(id);
    if (!updatedParking) {
        throw new ApiError(500, "Unable to reject parking.");
    }
    res.status(200).json(new ApiResponse(200, updatedParking, "Parking rejected successfully."));
});
//# sourceMappingURL=parking.controller.js.map