import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import { CreateVehicleInput } from "../../validations/vehicle/create.validation.js";
import { UpdateVehicleInput } from "../../validations/vehicle/update.validation.js";

class VehicleService {
  async create(
    ownerId: string,
    data: CreateVehicleInput
  ) {
    const exists =
      await vehicleRepository.findByRegistrationNumber(
        data.registrationNumber
      );

    if (exists) {
      throw new ApiError(
        409,
        "Vehicle already registered"
      );
    }

    const ownerVehicles =
      await vehicleRepository.findByOwnerId(ownerId);

    const vehicle =
      await vehicleRepository.create({
        ownerId,
        ...data,
        isDefault: ownerVehicles.length === 0,
      });

    return vehicle;
  }

  async getAll(ownerId: string) {
    return vehicleRepository.findByOwnerId(ownerId);
  }

  async getById(
    ownerId: string,
    vehicleId: string
  ) {
    const vehicle =
      await vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new ApiError(
        404,
        "Vehicle not found"
      );
    }

    if (
      vehicle.ownerId.toString() !== ownerId
    ) {
      throw new ApiError(
        403,
        "Access denied"
      );
    }

    return vehicle;
  }

  async update(
    ownerId: string,
    vehicleId: string,
    data: UpdateVehicleInput
  ) {
    const vehicle =
      await this.getById(ownerId, vehicleId);

    return vehicleRepository.update(
      vehicle.id,
      data
    );
  }

  async delete(
    ownerId: string,
    vehicleId: string
  ) {
    const vehicle =
      await this.getById(ownerId, vehicleId);

    return vehicleRepository.delete(
      vehicle.id
    );
  }

  async setDefault(
    ownerId: string,
    vehicleId: string
  ) {
    const vehicle =
      await this.getById(ownerId, vehicleId);

    await vehicleRepository.clearDefault(
      ownerId
    );

    return vehicleRepository.setDefault(
      vehicle.id
    );
  }
}

export default new VehicleService();