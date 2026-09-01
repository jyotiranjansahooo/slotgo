import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";
/* ============================================================
   HELPERS
   ============================================================ */
function getParamString(value, message) {
    if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, message);
    }
    return value;
}
export const getParkingSlots = asyncHandler(async (req, res) => {
    const parkingId = getParamString(req.params.parkingId, "Invalid parking ID.");
    const parking = await parkingRepository.findById(parkingId);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const slots = await parkingSlotRepository.findByParking(parkingId);
    res
        .status(200)
        .json(new ApiResponse(200, slots, "Parking slots fetched successfully."));
});
export const createParkingSlot = asyncHandler(async (req, res) => {
    const parkingId = getParamString(req.params.parkingId, "Invalid parking ID.");
    const parking = await parkingRepository.findById(parkingId);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const existingSlot = await parkingSlotRepository.findByParkingAndSlotNumber(parkingId, req.body.slotNumber);
    if (existingSlot) {
        throw new ApiError(409, `Slot ${req.body.slotNumber} already exists in this parking.`);
    }
    const slot = await parkingSlotRepository.create({
        ...req.body,
        parkingId,
    });
    res
        .status(201)
        .json(new ApiResponse(201, slot, "Parking slot created successfully."));
});
export const updateParkingSlot = asyncHandler(async (req, res) => {
    const parkingId = getParamString(req.params.parkingId, "Invalid parking ID.");
    const slotId = getParamString(req.params.slotId, "Invalid slot ID.");
    const parking = await parkingRepository.findById(parkingId);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const slot = await parkingSlotRepository.findById(slotId);
    if (!slot) {
        throw new ApiError(404, "Parking slot not found.");
    }
    if (slot.parkingId.toString() !== parkingId) {
        throw new ApiError(403, "This parking slot does not belong to this parking.");
    }
    if (req.body.slotNumber) {
        const existingSlot = await parkingSlotRepository.findByParkingAndSlotNumber(parkingId, req.body.slotNumber);
        if (existingSlot && existingSlot._id?.toString() !== slotId) {
            throw new ApiError(409, `Slot ${req.body.slotNumber} already exists in this parking.`);
        }
    }
    const updatedSlot = await parkingSlotRepository.update(slotId, req.body);
    if (!updatedSlot) {
        throw new ApiError(500, "Unable to update parking slot.");
    }
    res
        .status(200)
        .json(new ApiResponse(200, updatedSlot, "Parking slot updated successfully."));
});
/* ============================================================
   DELETE PARKING SLOT
   DELETE /api/v1/parkings/:parkingId/slots/:slotId
   ============================================================ */
export const deleteParkingSlot = asyncHandler(async (req, res) => {
    const parkingId = getParamString(req.params.parkingId, "Invalid parking ID.");
    const slotId = getParamString(req.params.slotId, "Invalid slot ID.");
    const parking = await parkingRepository.findById(parkingId);
    if (!parking) {
        throw new ApiError(404, "Parking not found.");
    }
    const slot = await parkingSlotRepository.findById(slotId);
    if (!slot) {
        throw new ApiError(404, "Parking slot not found.");
    }
    /* ----------------------------------------------------------
       Make sure slot belongs to this parking
    ---------------------------------------------------------- */
    if (slot.parkingId.toString() !== parkingId) {
        throw new ApiError(403, "This parking slot does not belong to this parking.");
    }
    const deletedSlot = await parkingSlotRepository.delete(slotId);
    if (!deletedSlot) {
        throw new ApiError(500, "Unable to delete parking slot.");
    }
    res
        .status(200)
        .json(new ApiResponse(200, null, "Parking slot deleted successfully."));
});
//# sourceMappingURL=parkingSlot.controller.js.map