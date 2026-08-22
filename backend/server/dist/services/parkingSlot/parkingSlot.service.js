import { Types } from "mongoose";
import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";
class ParkingSlotService {
    // ==========================================================
    // CREATE SLOT
    // ==========================================================
    async createSlot(ownerId, parkingId, data) {
        if (!Types.ObjectId.isValid(parkingId)) {
            throw new ApiError(400, "Invalid parking ID.");
        }
        // Check parking
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        // Check ownership
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to add slots to this parking.");
        }
        // Check active
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        // Parking must be approved
        if (parking.status !== "approved") {
            throw new ApiError(400, "Parking must be approved before adding slots.");
        }
        // Check duplicate slot
        const existingSlot = await parkingSlotRepository.findByParkingAndSlotNumber(parkingId, data.slotNumber);
        if (existingSlot) {
            throw new ApiError(409, "A slot with this number already exists in this parking.");
        }
        // Create slot
        const slot = await parkingSlotRepository.create({
            parkingId: new Types.ObjectId(parkingId),
            slotNumber: data.slotNumber.toUpperCase(),
            floor: data.floor,
            supportedVehicleTypes: data.supportedVehicleTypes,
            displayOrder: data.displayOrder,
            notes: data.notes,
            status: "available",
            isActive: true,
        });
        return slot;
    }
    // ==========================================================
    // GET AVAILABLE SLOTS
    // ==========================================================
    async getAvailableSlots(parkingId) {
        if (!Types.ObjectId.isValid(parkingId)) {
            throw new ApiError(400, "Invalid parking ID.");
        }
        const parking = await parkingRepository.findApprovedById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Approved parking not found.");
        }
        return parkingSlotRepository.findAvailable(parkingId);
    }
    // ==========================================================
    // GET ALL SLOTS FOR PARKING
    // ==========================================================
    async getParkingSlots(parkingId) {
        if (!Types.ObjectId.isValid(parkingId)) {
            throw new ApiError(400, "Invalid parking ID.");
        }
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        return parkingSlotRepository.findByParking(parkingId);
    }
    // ==========================================================
    // DELETE SLOT
    // ==========================================================
    async deleteSlot(ownerId, slotId) {
        if (!Types.ObjectId.isValid(slotId)) {
            throw new ApiError(400, "Invalid slot ID.");
        }
        const slot = await parkingSlotRepository.findById(slotId);
        if (!slot) {
            throw new ApiError(404, "Parking slot not found.");
        }
        const parking = await parkingRepository.findById(slot.parkingId.toString());
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        // Check parking owner
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to delete this slot.");
        }
        // Don't delete occupied/reserved slots
        if (slot.status === "occupied" ||
            slot.status === "reserved") {
            throw new ApiError(400, "Occupied or reserved slots cannot be deleted.");
        }
        return parkingSlotRepository.delete(slotId);
    }
}
export default new ParkingSlotService();
//# sourceMappingURL=parkingSlot.service.js.map