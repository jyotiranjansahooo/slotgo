import Vehicle from "../models/Vehicle.js";
class VehicleRepository {
    async create(vehicleData) {
        return Vehicle.create(vehicleData);
    }
    async findById(id) {
        return Vehicle.findById(id);
    }
    async findByOwnerId(ownerId) {
        return Vehicle.find({
            ownerId,
            isActive: true,
        }).sort({
            isDefault: -1,
            createdAt: -1,
        });
    }
    async findByRegistrationNumber(registrationNumber) {
        return Vehicle.findOne({
            registrationNumber: registrationNumber.toUpperCase(),
        });
    }
    async update(id, data) {
        return Vehicle.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        return Vehicle.findByIdAndUpdate(id, {
            isActive: false,
        }, {
            new: true,
        });
    }
    async clearDefault(ownerId) {
        return Vehicle.updateMany({ ownerId }, {
            isDefault: false,
        });
    }
    async setDefault(id) {
        return Vehicle.findByIdAndUpdate(id, {
            isDefault: true,
        }, {
            new: true,
        });
    }
}
export default new VehicleRepository();
//# sourceMappingURL=vehicle.repository.js.map