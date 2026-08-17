import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import parkingBookingBlockService from "../services/parking-booking-block/parking-booking-block.service.js";
export const createParkingBookingBlock = asyncHandler(async (req, res) => {
    const block = await parkingBookingBlockService.create(req.user._id.toString(), req.params.parkingId, req.body);
    res
        .status(201)
        .json(new ApiResponse(201, block, "New bookings paused successfully."));
});
export const getParkingBookingBlocks = asyncHandler(async (req, res) => {
    const blocks = await parkingBookingBlockService.getMyBlocks(req.user._id.toString(), req.params.parkingId);
    res
        .status(200)
        .json(new ApiResponse(200, blocks, "Booking pauses fetched successfully."));
});
export const deleteParkingBookingBlock = asyncHandler(async (req, res) => {
    await parkingBookingBlockService.delete(req.user._id.toString(), req.params.blockId);
    res
        .status(200)
        .json(new ApiResponse(200, null, "Booking pause removed successfully."));
});
//# sourceMappingURL=parking-booking-block.controller.js.map