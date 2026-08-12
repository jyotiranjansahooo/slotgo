import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
export const createVehicleService = async (data) => {
    const { ownerId, vehicleType, registrationNumber, brand, vehicleModel, color, } = data;
    const existingVehicle = await vehicleRepository.findByRegistrationNumber(registrationNumber);
    if (existingVehicle) {
        throw new ApiError(409, "Vehicle with this registration number already exists");
    }
    const vehicles = await vehicleRepository.findByOwnerId(ownerId);
    const isDefault = vehicles.length === 0;
    const vehicle = await vehicleRepository.create({
        ownerId,
        vehicleType,
        registrationNumber,
        // API/service uses manufacturer,
        // database model uses brand.
        brand,
        vehicleModel,
        color,
        isDefault,
    });
    return vehicle;
};
//# sourceMappingURL=create.service.js.map