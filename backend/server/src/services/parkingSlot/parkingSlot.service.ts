import ApiError from "../../utils/ApiError.js";

import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";

import {
  SLOT_STATUS,
} from "../../constants/slot.js";

import { CreateParkingSlotInput } from "../../validations/parkingSlot/create.validation.js";

class ParkingSlotService {
  async createSlot(
    ownerId: string,
    data: CreateParkingSlotInput,
  ) {
    const parking =
      await parkingRepository.findById(
        data.parkingId,
      );

    if (!parking) {
      throw new ApiError(
        404,
        "Parking not found.",
      );
    }

    if (
      parking.ownerId.toString() !==
      ownerId
    ) {
      throw new ApiError(
        403,
        "Unauthorized.",
      );
    }

    return parkingSlotRepository.create({
      parkingId: parking._id,
      slotNumber: data.slotNumber,
      floor: data.floor,
      supportedVehicleTypes:
        data.supportedVehicleTypes,
      displayOrder:
        data.displayOrder,
      status: SLOT_STATUS.AVAILABLE,
    });
  }

  async getParkingSlots(
    parkingId: string,
  ) {
    return parkingSlotRepository.findByParking(
      parkingId,
    );
  }

  async deleteSlot(
    ownerId: string,
    slotId: string,
  ) {
    const slot =
      await parkingSlotRepository.findById(
        slotId,
      );

    if (!slot) {
      throw new ApiError(
        404,
        "Parking slot not found.",
      );
    }

    const parking =
      await parkingRepository.findById(
        slot.parkingId.toString(),
      );

    if (!parking) {
      throw new ApiError(
        404,
        "Parking not found.",
      );
    }

    if (
      parking.ownerId.toString() !==
      ownerId
    ) {
      throw new ApiError(
        403,
        "Unauthorized.",
      );
    }

    return parkingSlotRepository.delete(
      slotId,
    );
  }
}

export default new ParkingSlotService();