import ApiError from "../../utils/ApiError.js";
import vehicleRepository from "../../repositories/vehicle.repository.js";
class VehicleService {
    // ==========================================================
    // CREATE VEHICLE
    // ==========================================================
    async create(ownerId, data) {
        const registrationNumber = data.registrationNumber.trim().toUpperCase();
        const exists = await vehicleRepository.findByRegistrationNumber(registrationNumber);
        if (exists) {
            throw new ApiError(409, "This vehicle is already registered. You need permission from the original owner.");
        }
        const ownerVehicles = await vehicleRepository.findByOwnerId(ownerId);
        const vehicle = await vehicleRepository.create({
            ownerId,
            vehicleType: data.vehicleType,
            registrationNumber,
            brand: data.brand,
            vehicleModel: data.vehicleModel,
            color: data.color,
            isDefault: ownerVehicles.length === 0,
        });
        return vehicle;
    }
    // ==========================================================
    // GET ALL MY VEHICLES
    // ==========================================================
    async getAll(ownerId) {
        return vehicleRepository.findByOwnerId(ownerId);
    }
    // ==========================================================
    // GET SINGLE VEHICLE
    // ==========================================================
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
    // ==========================================================
    // UPDATE VEHICLE
    // ==========================================================
    async update(ownerId, vehicleId, data) {
        const vehicle = await this.getById(ownerId, vehicleId);
        const updatedVehicle = await vehicleRepository.update(vehicle.id, data);
        if (!updatedVehicle) {
            throw new ApiError(404, "Vehicle could not be updated");
        }
        return updatedVehicle;
    }
    // ==========================================================
    // DELETE VEHICLE
    // ==========================================================
    async delete(ownerId, vehicleId) {
        const vehicle = await this.getById(ownerId, vehicleId);
        const deletedVehicle = await vehicleRepository.delete(vehicle.id);
        if (!deletedVehicle) {
            throw new ApiError(404, "Vehicle could not be deleted");
        }
        return deletedVehicle;
    }
    // ==========================================================
    // SET DEFAULT VEHICLE
    // ==========================================================
    async setDefault(ownerId, vehicleId) {
        const vehicle = await this.getById(ownerId, vehicleId);
        await vehicleRepository.clearDefault(ownerId);
        const updatedVehicle = await vehicleRepository.setDefault(vehicle.id);
        if (!updatedVehicle) {
            throw new ApiError(404, "Vehicle could not be set as default");
        }
        return updatedVehicle;
    }
}
export default new VehicleService();
//# sourceMappingURL=vehicle.service.js.map