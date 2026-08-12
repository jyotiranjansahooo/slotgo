import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
class VehicleService {
    async create(ownerId, data) {
        const exists = await vehicleRepository.findByRegistrationNumber(data.registrationNumber);
        if (exists) {
            throw new ApiError(409, "Vehicle already registered");
        }
        const ownerVehicles = await vehicleRepository.findByOwnerId(ownerId);
        const vehicle = await vehicleRepository.create({
            ownerId,
            ...data,
            isDefault: ownerVehicles.length === 0,
        });
        return vehicle;
    }
    async getAll(ownerId) {
        return vehicleRepository.findByOwnerId(ownerId);
    }
    async getById(ownerId, vehicleId) {
        const vehicle = await vehicleRepository.findById(vehicleId);
        if (!vehicle) {
            throw new ApiError(404, "Vehicle not found");
        }
        if (vehicle.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "Access denied");
        }
        return vehicle;
    }
    async update(ownerId, vehicleId, data) {
        const vehicle = await this.getById(ownerId, vehicleId);
        return vehicleRepository.update(vehicle.id, data);
    }
    async delete(ownerId, vehicleId) {
        const vehicle = await this.getById(ownerId, vehicleId);
        return vehicleRepository.delete(vehicle.id);
    }
    async setDefault(ownerId, vehicleId) {
        const vehicle = await this.getById(ownerId, vehicleId);
        await vehicleRepository.clearDefault(ownerId);
        return vehicleRepository.setDefault(vehicle.id);
    }
}
export default new VehicleService();
//# sourceMappingURL=vehicle.service.js.map