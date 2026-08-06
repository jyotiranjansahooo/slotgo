import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
import { CreateVehicleInput } from "../../validations/vehicle/create.validation.js";

interface CreateVehicleServiceInput extends CreateVehicleInput {
  ownerId: string;
}

export const createVehicleService = async (
  data: CreateVehicleServiceInput
) => {
  const {
    ownerId,
    vehicleType,
    registrationNumber,
    manufacturer,
    vehicleModel,
    color,
  } = data;

  // Check registration number
  const existingVehicle =
    await vehicleRepository.findByRegistrationNumber(
      registrationNumber
    );

  if (existingVehicle) {
    throw new ApiError(
      409,
      "Vehicle with this registration number already exists"
    );
  }

  // Check if user already has vehicles
  const vehicles =
    await vehicleRepository.findByOwnerId(ownerId);

  const isDefault = vehicles.length === 0;

  // Create vehicle
  const vehicle = await vehicleRepository.create({
    ownerId,
    vehicleType,
    registrationNumber,
    manufacturer,
    vehicleModel,
    color,
    isDefault,
  });

  return vehicle;
};