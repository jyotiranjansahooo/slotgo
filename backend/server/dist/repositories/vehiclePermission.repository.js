import VehiclePermission from "../models/VehiclePermission.js";
class VehiclePermissionRepository {
    async findByVehicleAndUser(vehicleId, userId) {
        return VehiclePermission.findOne({
            vehicleId,
            userId,
        });
    }
    async findApprovedByUser(userId) {
        return VehiclePermission.find({
            userId,
            status: "approved",
        }).populate("vehicleId");
    }
    async findByVehicle(vehicleId) {
        return VehiclePermission.find({
            vehicleId,
        }).populate("userId");
    }
    async create(data) {
        return VehiclePermission.create({
            ...data,
            status: data.status ?? "pending",
        });
    }
    async approve(vehicleId, userId) {
        return VehiclePermission.findOneAndUpdate({
            vehicleId,
            userId,
        }, {
            status: "approved",
            grantedAt: new Date(),
            revokedAt: null,
        }, {
            new: true,
        });
    }
    async revoke(vehicleId, userId) {
        return VehiclePermission.findOneAndUpdate({
            vehicleId,
            userId,
        }, {
            status: "revoked",
            revokedAt: new Date(),
        }, {
            new: true,
        });
    }
}
export default new VehiclePermissionRepository();
//# sourceMappingURL=vehiclePermission.repository.js.map