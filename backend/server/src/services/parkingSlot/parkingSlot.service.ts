import ApiError from "../../utils/ApiError.js";

import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import { SLOT_STATUS } from "../../constants/slot.js";

import { CreateParkingSlotInput } from "../../validations/parkingslot/create.validation.js";

class ParkingSlotService {
  async createSlot(ownerId: string, data: CreateParkingSlotInput) {
    const parking = await parkingRepository.findById(data.parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(403, "You are not authorized to manage this parking.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is inactive.");
    }

    if (parking.status !== "approved") {
      throw new ApiError(
        400,
        "Parking must be approved before creating slots.",
      );
    }
    const existingSlot = await parkingSlotRepository.findByParkingAndSlotNumber(
      data.parkingId,
      data.slotNumber,
    );

    if (existingSlot) {
      throw new ApiError(409, "Slot number already exists in this parking.");
    }
    return parkingSlotRepository.create({
      parkingId: parking._id,
      slotNumber: data.slotNumber,
      floor: data.floor,
      supportedVehicleTypes: data.supportedVehicleTypes,
      displayOrder: data.displayOrder,
      status: SLOT_STATUS.AVAILABLE,
      isActive: true,
    });
  }
  async getAvailableSlots(parkingId: string) {
    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is inactive.");
    }

    if (parking.status !== "approved") {
      throw new ApiError(400, "Parking is not available for booking.");
    }

    return parkingSlotRepository.findAvailable(parkingId);
  }
  async getParkingSlots(parkingId: string) {
    return parkingSlotRepository.findByParking(parkingId);
  }

  async deleteSlot(ownerId: string, slotId: string) {
    const slot = await parkingSlotRepository.findById(slotId);

    if (!slot) {
      throw new ApiError(404, "Parking slot not found.");
    }

    const parking = await parkingRepository.findById(slot.parkingId.toString());

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(403, "Unauthorized.");
    }

    return parkingSlotRepository.delete(slotId);
  }
}

export default new ParkingSlotService();
