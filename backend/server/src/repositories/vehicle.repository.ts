import Vehicle, { IVehicle } from "../models/Vehicle.js";

export interface CreateVehicleData {
  ownerId: string;

  vehicleType: IVehicle["vehicleType"];

  registrationNumber: string;

  brand: string;

  vehicleModel: string;

  color: string;

  isDefault: boolean;
}

class VehicleRepository {
  // ==========================================================
  // CREATE
  // ==========================================================

  async create(vehicleData: CreateVehicleData) {
    return Vehicle.create(vehicleData);
  }

  // ==========================================================
  // FIND BY ID
  // ==========================================================

  async findById(id: string) {
    return Vehicle.findById(id);
  }

  // ==========================================================
  // FIND ALL VEHICLES OF OWNER
  // ==========================================================

  async findByOwnerId(ownerId: string) {
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

  async findByRegistrationNumber(registrationNumber: string) {
    return Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  async update(
    id: string,
    data: Partial<Omit<CreateVehicleData, "ownerId">>,
  ) {
    return Vehicle.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  // ==========================================================
  // SOFT DELETE
  // ==========================================================

  async delete(id: string) {
    return Vehicle.findByIdAndUpdate(
      id,
      {
        isActive: false,
        isDefault: false,
      },
      {
        new: true,
      },
    );
  }

  // ==========================================================
  // CLEAR DEFAULT
  // ==========================================================

  async clearDefault(ownerId: string) {
    return Vehicle.updateMany(
      {
        ownerId,
        isActive: true,
      },
      {
        isDefault: false,
      },
    );
  }

  // ==========================================================
  // SET DEFAULT
  // ==========================================================

  async setDefault(id: string) {
    return Vehicle.findByIdAndUpdate(
      id,
      {
        isDefault: true,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export default new VehicleRepository();