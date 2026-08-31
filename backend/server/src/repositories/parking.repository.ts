import { Types } from "mongoose";

import Parking, { IParking } from "../models/Parking.js";

class ParkingRepository {
  async create(data: Partial<IParking>) {
    return Parking.create(data);
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findById(id).lean();
  }

  async findApprovedById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findOne({
      _id: new Types.ObjectId(id),
      status: "approved",
      isActive: true,
      isTemporarilyClosed: false,
    }).lean();
  }

  // FIND PARKINGS BY OWNER

  async findByOwner(ownerId: string) {
    if (!Types.ObjectId.isValid(ownerId)) {
      return [];
    }

    return Parking.find({
      ownerId: new Types.ObjectId(ownerId),
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async findAll() {
    return Parking.find()
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async update(id: string, data: Partial<IParking>) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }

  // DEACTIVATE / SOFT DELETE

  async deactivate(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        isActive: false,
        deletedAt: new Date(),
        isTemporarilyClosed: false,
        temporaryClosedReason: "",
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // HARD DELETE
  //
  // Keep this method available, but owner deletion should use
  // deactivate() so existing bookings/reviews/history are not
  // destroyed.
  //

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndDelete(id);
  }

  // TEMPORARILY CLOSE

  async temporarilyClose(id: string, reason: string = "") {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        isTemporarilyClosed: true,
        temporaryClosedReason: reason.trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  // REOPEN

  async reopen(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Parking.findByIdAndUpdate(
      id,
      {
        isTemporarilyClosed: false,
        temporaryClosedReason: "",
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

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

  async findApprovedParkings() {
    return Parking.find({
      status: "approved",
      isActive: true,
      isTemporarilyClosed: false,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  // SEARCH PARKINGS

  async searchParkings(filters: { city?: string; parkingType?: string }) {
    const query: Record<string, unknown> = {
      status: "approved",
      isActive: true,
      isTemporarilyClosed: false,
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
