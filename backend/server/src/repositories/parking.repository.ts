import Parking, { IParking } from "../models/Parking.js";

class ParkingRepository {
  async create(data: Partial<IParking>) {
    return Parking.create(data);
  }

  async findById(id: string) {
    return Parking.findById(id);
  }

  async findByOwner(ownerId: string) {
    return Parking.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }

  async findAll() {
    return Parking.find().sort({
      createdAt: -1,
    });
  }

  async update(
    id: string,
    data: Partial<IParking>,
  ) {
    return Parking.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );
  }

  async delete(id: string) {
    return Parking.findByIdAndDelete(id);
  }

  async approve(id: string) {
    return Parking.findByIdAndUpdate(
      id,
      {
        status: "approved",
      },
      {
        new: true,
      },
    );
  }

  async reject(id: string) {
    return Parking.findByIdAndUpdate(
      id,
      {
        status: "rejected",
      },
      {
        new: true,
      },
    );
  }
}

export default new ParkingRepository();