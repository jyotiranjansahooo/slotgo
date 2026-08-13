import Parking, { IParking } from "../models/Parking.js";

class ParkingRepository {
  async create(data: Partial<IParking>) {
    return Parking.create(data);
  }

  async findById(id: string) {
    return Parking.findById(id);
  }
  async findApprovedById(id: string) {
  return Parking.findOne({
    _id: id,
    status: "approved",
    isActive: true,
  });
}

async findByOwner(ownerId: string) {
  return Parking.find({
    ownerId,
    isActive: true,
  }).sort({
    createdAt: -1,
  });
}

  async findAll() {
    return Parking.find().sort({
      createdAt: -1,
    });
  }

  async update(id: string, data: Partial<IParking>) {
    return Parking.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
async deactivate(id: string) {
  return Parking.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
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
async findApprovedParkings() {
  return Parking.find({
    status: "approved",
    isActive: true,
  }).sort({
    createdAt: -1,
  });
}

async searchParkings(filters: {
  city?: string;
  parkingType?: string;
}) {
  const query: Record<string, unknown> = {
    status: "approved",
    isActive: true,
  };

  if (filters.city) {
    query.city = {
      $regex: filters.city,
      $options: "i",
    };
  }

  if (filters.parkingType) {
    query.parkingType = filters.parkingType;
  }

  return Parking.find(query).sort({
    createdAt: -1,
  });
}


}

export default new ParkingRepository();
