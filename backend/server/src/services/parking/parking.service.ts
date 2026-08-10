import ApiError from "../../utils/ApiError.js";

import parkingRepository from "../../repositories/parking.repository.js";
import { Types } from "mongoose";
import { PARKING_STATUS } from "../../constants/parking.js";

import { CreateParkingInput } from "../../validations/parking/create.validation.js";

class ParkingService {
 async createParking(
  ownerId: string,
  data: CreateParkingInput,
) {
  if (!Types.ObjectId.isValid(ownerId)) {
    throw new ApiError(
      400,
      "Invalid owner ID.",
    );
  }

  const parking = await parkingRepository.create({
    ownerId: new Types.ObjectId(ownerId),
    ...data,
    status: PARKING_STATUS.PENDING,
    isActive: true,
  });

  return parking;
}

  async getMyParkings(ownerId: string) {
    return parkingRepository.findByOwner(ownerId);
  }

  async getParkingById(id: string) {
    const parking = await parkingRepository.findById(id);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    return parking;
  }

  async deactivateParking(ownerId: string, parkingId: string) {
    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(403, "You are not authorized to modify this parking.");
    }

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is already inactive.");
    }

    return parkingRepository.deactivate(parkingId);
  }
}

export default new ParkingService();
