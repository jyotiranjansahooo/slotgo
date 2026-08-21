import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
export const createVehicleService = async (data) => {
    const { ownerId, vehicleType, registrationNumber, brand, vehicleModel, color, } = data;
    // Normalize registration number
    const normalizedRegistrationNumber = registrationNumber.trim().toUpperCase();
    // Check whether vehicle already exists
    const existingVehicle = await vehicleRepository.findByRegistrationNumber(normalizedRegistrationNumber);
    if (existingVehicle) {
        throw new ApiError(409, "Vehicle with this registration number already exists");
    }
    const vehicles = await vehicleRepository.findByOwnerId(ownerId);
    const isDefault = vehicles.length === 0;
    const vehicle = await vehicleRepository.create({
        ownerId,
        vehicleType,
        registrationNumber: normalizedRegistrationNumber,
        brand: brand.trim(),
        vehicleModel: vehicleModel.trim(),
        color: color.trim(),
        isDefault,
    });
    return vehicle;
};
//# sourceMappingURL=create.service.js.map