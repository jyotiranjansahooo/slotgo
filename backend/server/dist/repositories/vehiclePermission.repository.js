import VehiclePermission, { 
// IVehiclePermission,
VEHICLE_PERMISSION_STATUS, } from "../models/VehiclePermission.js";
class VehiclePermissionRepository {
    async create(data) {
        return VehiclePermission.create({
            vehicleId: data.vehicleId,
            ownerId: data.ownerId,
            driverId: data.driverId,
            status: VEHICLE_PERMISSION_STATUS.APPROVED,
            grantedAt: new Date(),
            revokedAt: null,
        });
    }
    // ==========================================================
    // FIND PERMISSION
    // ==========================================================
    async findByVehicleAndDriver(vehicleId, driverId) {
        return VehiclePermission.findOne({
            vehicleId,
            driverId,
        });
    }
    // ==========================================================
    // FIND ACTIVE PERMISSION
    // ==========================================================
    async findActivePermission(vehicleId, driverId) {
        return VehiclePermission.findOne({
            vehicleId,
            driverId,
            status: VEHICLE_PERMISSION_STATUS.APPROVED,
        });
    }
    // ==========================================================
    // GET ALL DRIVERS FOR A VEHICLE
    // ==========================================================
    async findByVehicleId(vehicleId) {
        return VehiclePermission.find({
            vehicleId,
        })
            .populate("driverId", "name email phoneNumber avatar")
            .sort({
            createdAt: -1,
        });
    }
    // ==========================================================
    // GET ALL VEHICLE PERMISSIONS OF A DRIVER
    // ==========================================================
    async findByDriverId(driverId) {
        return VehiclePermission.find({
            driverId,
            status: VEHICLE_PERMISSION_STATUS.APPROVED,
        })
            .populate("vehicleId", "registrationNumber vehicleType brand vehicleModel color ownerId")
            .sort({
            createdAt: -1,
        });
    }
    async revoke(id) {
        return VehiclePermission.findByIdAndUpdate(id, {
            status: VEHICLE_PERMISSION_STATUS.REVOKED,
            revokedAt: new Date(),
        }, {
            new: true,
        });
    }
    async revokeByVehicleAndDriver(vehicleId, driverId) {
        return VehiclePermission.findOneAndUpdate({
            vehicleId,
            driverId,
            status: VEHICLE_PERMISSION_STATUS.APPROVED,
        }, {
            status: VEHICLE_PERMISSION_STATUS.REVOKED,
            revokedAt: new Date(),
        }, {
            new: true,
        });
    }
}
export default new VehiclePermissionRepository();
//# sourceMappingURL=vehiclePermission.repository.js.map