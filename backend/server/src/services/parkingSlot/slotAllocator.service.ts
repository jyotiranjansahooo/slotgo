import ApiError from "../../utils/ApiError.js";

import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import { VehicleType } from "../../constants/vehicle.js";

class SlotAllocatorService {
  async findAvailableSlot(parkingId: string, vehicleType: VehicleType) {
    await parkingSlotRepository.releaseExpiredReservations();

    return parkingSlotRepository.findFirstAvailable(parkingId, vehicleType);
  }
async confirmReservation(
  slotId: string,
) {
  const slot =
    await parkingSlotRepository.confirmReservation(
      slotId,
    );

  if (!slot) {
    throw new ApiError(
      409,
      "Parking slot reservation could not be confirmed.",
    );
  }

  return slot;
}

  async reserveAvailableSlot(parkingId: string, vehicleType: VehicleType) {
    // Release expired temporary reservations first.
    await parkingSlotRepository.releaseExpiredReservations();

    const reservedUntil = new Date(Date.now() + 15 * 60 * 1000);

    const slot = await parkingSlotRepository.reserve(
      parkingId,
      vehicleType,
      reservedUntil,
    );

    if (!slot) {
      throw new ApiError(
        409,
        "No parking slot is available for this vehicle type.",
      );
    }

    return slot;
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
