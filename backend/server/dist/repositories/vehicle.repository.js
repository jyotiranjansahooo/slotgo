import Vehicle from "../models/Vehicle.js";
class VehicleRepository {
    // ==========================================================
    // CREATE
    // ==========================================================
    async create(vehicleData) {
        return Vehicle.create(vehicleData);
    }
    // ==========================================================
    // FIND BY ID
    // ==========================================================
    async findById(id) {
        return Vehicle.findById(id);
    }
    // ==========================================================
    // FIND ALL VEHICLES OF OWNER
    // ==========================================================
    async findByOwnerId(ownerId) {
        return Vehicle.find({
            ownerId,
            isActive: true,
        }).sort({
            isDefault: -1,
            createdAt: -1,
        });
    }
    // ==========================================================
    // FIND BY REGISTRATION NUMBER
    // ==========================================================
    async findByRegistrationNumber(registrationNumber) {
        return Vehicle.findOne({
            registrationNumber: registrationNumber.toUpperCase(),
        });
    }
    // ==========================================================
    // UPDATE
    // ==========================================================
    async update(id, data) {
        return Vehicle.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    // ==========================================================
    // SOFT DELETE
    // ==========================================================
    async delete(id) {
        return Vehicle.findByIdAndUpdate(id, {
            isActive: false,
            isDefault: false,
        }, {
            new: true,
        });
    }
    // ==========================================================
    // CLEAR DEFAULT
    // ==========================================================
    async clearDefault(ownerId) {
        return Vehicle.updateMany({
            ownerId,
            isActive: true,
        }, {
            isDefault: false,
        });
    }
    // ==========================================================
    // SET DEFAULT
    // ==========================================================
    async setDefault(id) {
        return Vehicle.findByIdAndUpdate(id, {
            isDefault: true,
        }, {
            new: true,
            runValidators: true,
        });
    }
}
export default new VehicleRepository();
//# sourceMappingURL=vehicle.repository.js.map