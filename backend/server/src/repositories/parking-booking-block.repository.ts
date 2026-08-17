import ParkingBookingBlock from "../models/ParkingBookingBlock.js";
import { CreateParkingBookingBlockInput } from "../validations/parking-booking-block/create.validation.js";

class ParkingBookingBlockRepository {
  async create(
    data: CreateParkingBookingBlockInput & {
      parkingId: string;
      createdBy: string;
    },
  ) {
    return ParkingBookingBlock.create(data);
  }

  async findById(id: string) {
    return ParkingBookingBlock.findById(id);
  }

  async findByParking(parkingId: string) {
    return ParkingBookingBlock.find({
      parkingId,
      endTime: {
        $gt: new Date(),
      },
    }).sort({
      startTime: 1,
    });
  }

  async findOverlapping(
    parkingId: string,
    startTime: Date,
    endTime: Date,
  ) {
    return ParkingBookingBlock.findOne({
      parkingId,

      startTime: {
        $lt: endTime,
      },

      endTime: {
        $gt: startTime,
      },
    });
  }

  async delete(id: string) {
    return ParkingBookingBlock.findByIdAndDelete(id);
  }
}

export default new ParkingBookingBlockRepository();