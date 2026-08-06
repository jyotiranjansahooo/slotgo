import Vehicle, { IVehicle } from "../models/Vehicle.js";

export interface CreateVehicleData {
  ownerId: string;

  vehicleType: IVehicle["vehicleType"];

  registrationNumber: string;

  manufacturer: string;

  vehicleModel: string;

  color: string;

  isDefault: boolean;
}

class VehicleRepository {
  async create(vehicleData: CreateVehicleData) {
    return Vehicle.create(vehicleData);
  }

  async findById(id: string) {
    return Vehicle.findById(id);
  }

  async findByOwnerId(ownerId: string) {
    return Vehicle.find({
      ownerId,
      isActive: true,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });
  }

  async findByRegistrationNumber(registrationNumber: string) {
    return Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });
  }

  async update(id: string, data: Partial<CreateVehicleData>) {
    return Vehicle.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string) {
    return Vehicle.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
  }

  async clearDefault(ownerId: string) {
    return Vehicle.updateMany(
      { ownerId },
      {
        isDefault: false,
      },
    );
  }

  async setDefault(id: string) {
    return Vehicle.findByIdAndUpdate(
      id,
      {
        isDefault: true,
      },
      {
        new: true,
      },
    );
  }
}

export default new VehicleRepository();
