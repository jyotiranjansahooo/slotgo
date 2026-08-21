import VehiclePermission from "../models/VehiclePermission.js";

class VehiclePermissionRepository {
  async findByVehicleAndUser(
    vehicleId: string,
    userId: string,
  ) {
    return VehiclePermission.findOne({
      vehicleId,
      userId,
    });
  }

  async findApprovedByUser(userId: string) {
    return VehiclePermission.find({
      userId,
      status: "approved",
    }).populate("vehicleId");
  }

  async findByVehicle(vehicleId: string) {
    return VehiclePermission.find({
      vehicleId,
    }).populate("userId");
  }

  async create(data: {
    vehicleId: string;
    userId: string;
    grantedBy: string;
    status?: "pending" | "approved" | "revoked";
  }) {
    return VehiclePermission.create({
      ...data,
      status: data.status ?? "pending",
    });
  }

  async approve(
    vehicleId: string,
    userId: string,
  ) {
    return VehiclePermission.findOneAndUpdate(
      {
        vehicleId,
        userId,
      },
      {
        status: "approved",
        grantedAt: new Date(),
        revokedAt: null,
      },
      {
        new: true,
      },
    );
  }

  async revoke(
    vehicleId: string,
    userId: string,
  ) {
    return VehiclePermission.findOneAndUpdate(
      {
        vehicleId,
        userId,
      },
      {
        status: "revoked",
        revokedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }
}

export default new VehiclePermissionRepository();