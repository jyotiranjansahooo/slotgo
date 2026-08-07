import ApiError from "../../utils/ApiError.js";

import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import { VehicleType } from "../../constants/vehicle.js";

class SlotAllocatorService {
  async reserveAvailableSlot(
    parkingId: string,
    vehicleType: VehicleType,
  ) {
    const slot =
      await parkingSlotRepository.findFirstAvailable(
        parkingId,
        vehicleType,
      );

    if (!slot) {
      throw new ApiError(
        400,
        "No parking slot available.",
      );
    }

    const reservedUntil = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    await parkingSlotRepository.reserve(
      slot._id.toString(),
      reservedUntil,
    );

    return slot;
  }
}

export default new SlotAllocatorService();