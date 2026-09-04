import { Types } from "mongoose";

import ApiError from "../../utils/ApiError.js";

import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import { CreateParkingSlotInput } from "../../validations/parkingslot/create.validation.js";

class ParkingSlotService {
  async createSlot(
    ownerId: string,
    parkingId: string,
    data: CreateParkingSlotInput,
  ) {
    if (!Types.ObjectId.isValid(parkingId)) {
      throw new ApiError(400, "Invalid parking ID.");
    }

    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(
        403,
        "You are not authorized to add slots to this parking.",
      );
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is inactive.");
    }

    if (parking.status !== "approved") {
      throw new ApiError(400, "Parking must be approved before adding slots.");
    }

    const existingSlot = await parkingSlotRepository.findByParkingAndSlotNumber(
      parkingId,
      data.slotNumber,
    );

    if (existingSlot) {
      throw new ApiError(
        409,
        "A slot with this number already exists in this parking.",
      );
    }

    const slot = await parkingSlotRepository.create({
      parkingId: new Types.ObjectId(parkingId),
      slotNumber: data.slotNumber.toUpperCase(),
      floor: data.floor,
      capacity: data.capacity,
      occupiedCount: 0,
      reservedCount: 0,
      supportedVehicleTypes: data.supportedVehicleTypes,
      displayOrder: data.displayOrder,
      notes: data.notes,
      status: "available",
      isActive: true,
    });

    return slot;
  }

  async getAvailableSlots(parkingId: string) {
    if (!Types.ObjectId.isValid(parkingId)) {
      throw new ApiError(400, "Invalid parking ID.");
    }

    const parking = await parkingRepository.findApprovedById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Approved parking not found.");
    }

    return parkingSlotRepository.findAvailable(parkingId);
  }

  async getParkingSlots(parkingId: string) {
    if (!Types.ObjectId.isValid(parkingId)) {
      throw new ApiError(400, "Invalid parking ID.");
    }

    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    return parkingSlotRepository.findByParking(parkingId);
  }

  async deleteSlot(ownerId: string, slotId: string) {
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

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(403, "You are not authorized to delete this slot.");
    }

    if (slot.occupiedCount > 0 || slot.reservedCount > 0) {
      throw new ApiError(
        400,
        "Slots with occupied or temporarily reserved capacity cannot be deleted.",
      );
    }

    return parkingSlotRepository.delete(slotId);
  }
}

export default new ParkingSlotService();
