import ApiError from "../../utils/ApiError.js";

import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import { VehicleType } from "../../constants/vehicle.js";

class SlotAllocatorService {
  async findAvailableSlot(parkingId: string, vehicleType: VehicleType) {
    const slot = await parkingSlotRepository.findFirstAvailable(
      parkingId,
      vehicleType,
    );

    return slot;
  }
async finalizeReservation(
  slotId: string,
  endTime: Date,
) {
  const slot =
    await parkingSlotRepository.finalizeReservation(
      slotId,
      endTime,
    );

  if (!slot) {
    throw new ApiError(
      404,
      "Parking slot reservation not found.",
    );
  }

  return slot;
}
  async reserveAvailableSlot(parkingId: string, vehicleType: VehicleType) {
    const slot = await this.findAvailableSlot(parkingId, vehicleType);

    if (!slot) {
      throw new ApiError(
        409,
        "No parking slot is available for this vehicle type.",
      );
    }

    const reservedUntil = new Date(Date.now() + 15 * 60 * 1000);

    const reservedSlot = await parkingSlotRepository.reserve(
      slot._id.toString(),
      reservedUntil,
    );

    if (!reservedSlot) {
      throw new ApiError(409, "Unable to reserve the parking slot.");
    }

    return reservedSlot;
  }

  async releaseSlot(slotId: string) {
    const slot = await parkingSlotRepository.release(slotId);

    if (!slot) {
      throw new ApiError(404, "Parking slot not found.");
    }

    return slot;
  }

  async occupySlot(slotId: string) {
    const slot = await parkingSlotRepository.occupy(slotId);

    if (!slot) {
      throw new ApiError(404, "Parking slot not found.");
    }

    return slot;
  }
}

export default new SlotAllocatorService();
