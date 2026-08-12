import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import parkingSlotService from "../services/parkingSlot/parkingSlot.service.js";
export const createSlot = asyncHandler(async (req, res) => {
    const slot = await parkingSlotService.createSlot(req.user._id.toString(), req.body);
    res
        .status(201)
        .json(new ApiResponse(201, slot, "Parking slot created successfully."));
});
export const getAvailableSlots = asyncHandler(async (req, res) => {
    const { parkingId } = req.params;
    const slots = await parkingSlotService.getAvailableSlots(parkingId);
    res
        .status(200)
        .json(new ApiResponse(200, slots, "Available parking slots fetched successfully."));
});
export const getParkingSlots = asyncHandler(async (req, res) => {
    const { parkingId } = req.params;
    const slots = await parkingSlotService.getParkingSlots(parkingId);
    res
        .status(200)
        .json(new ApiResponse(200, slots, "Parking slots fetched successfully."));
});
export const deleteSlot = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    await parkingSlotService.deleteSlot(req.user._id.toString(), slotId);
    res
        .status(200)
        .json(new ApiResponse(200, null, "Parking slot deleted successfully."));
});
//# sourceMappingURL=parkingSlot.controller.js.map