import { Types } from "mongoose";
import Parking, { IParking } from "../models/Parking.js";

class ParkingRepository {
  // =========================================================
  // CREATE
  // =========================================================

  async create(data: Partial<IParking>) {
    return Parking.create(data);
  }

  // =========================================================
  // FIND BY ID
  // =========================================================

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findById(id).lean();
  }

  // =========================================================
  // FIND APPROVED PARKING BY ID
  // =========================================================

  async findApprovedById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findOne({
      _id: new Types.ObjectId(id),
      status: "approved",
      isActive: true,
    }).lean();
  }

async findByOwner(ownerId: string) {
  console.log("🔥🔥🔥 FIND BY OWNER WAS CALLED 🔥🔥🔥");
  console.log("OWNER ID =", ownerId);

  const parkings = await Parking.find({});

  console.log("🔥 TOTAL PARKINGS =", parkings.length);

  return parkings;
}

  async findAll() {
    return Parking.find()
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    id: string,
    data: Partial<IParking>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // =========================================================
  // DEACTIVATE
  // =========================================================

  async deactivate(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // =========================================================
  // DELETE
  // =========================================================

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndDelete(id);
  }

  // =========================================================
  // APPROVE
  // =========================================================

  async approve(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        status: "approved",
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // =========================================================
  // REJECT
  // =========================================================

  async reject(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        status: "rejected",
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // =========================================================
  // APPROVED PARKINGS
  // =========================================================

  async findApprovedParkings() {
    return Parking.find({
      status: "approved",
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  // =========================================================
  // SEARCH
  // =========================================================

  async searchParkings(filters: {
    city?: string;
    parkingType?: string;
  }) {
    const query: Record<string, unknown> = {
      status: "approved",
      isActive: true,
    };

    if (filters.city?.trim()) {
      query.city = {
        $regex: filters.city.trim(),
        $options: "i",
      };
    }

    if (filters.parkingType?.trim()) {
      query.parkingType = filters.parkingType.trim();
    }

    return Parking.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();
  }
}

export default new ParkingRepository();