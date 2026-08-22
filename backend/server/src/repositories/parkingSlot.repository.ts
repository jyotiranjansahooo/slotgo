import ParkingSlot, { IParkingSlot } from "../models/ParkingSlot.js";

import { SLOT_STATUS, SlotStatus } from "../constants/slot.js";

import { VehicleType } from "../constants/vehicle.js";

class ParkingSlotRepository {
  async create(data: Partial<IParkingSlot>) {
    return ParkingSlot.create(data);
  }

  async findById(id: string) {
    return ParkingSlot.findById(id);
  }
  async findByParkingAndSlotNumber(parkingId: string, slotNumber: string) {
    return ParkingSlot.findOne({
      parkingId,
      slotNumber: slotNumber.toUpperCase(),
    });
  }

  async findByParking(parkingId: string) {
    return ParkingSlot.find({
      parkingId,
    }).sort({
      displayOrder: 1,
    });
  }
  async findAvailableByVehicleType(
    parkingId: string,
    vehicleType: VehicleType,
  ) {
    return ParkingSlot.find({
      parkingId,
      status: SLOT_STATUS.AVAILABLE,
      isActive: true,
      supportedVehicleTypes: vehicleType,
    }).sort({
      displayOrder: 1,
    });
  }

  async findAvailable(parkingId: string) {
    return ParkingSlot.find({
      parkingId,
      status: SLOT_STATUS.AVAILABLE,
      isActive: true,
    }).sort({
      displayOrder: 1,
    });
  }

  async findFirstAvailable(parkingId: string, vehicleType: VehicleType) {
    return ParkingSlot.findOne({
      parkingId,

      status: SLOT_STATUS.AVAILABLE,

      isActive: true,

      supportedVehicleTypes: vehicleType,
    }).sort({
      displayOrder: 1,
    });
  }

  async reserve(
    parkingId: string,
    vehicleType: VehicleType,
    reservedUntil: Date,
  ) {
    return ParkingSlot.findOneAndUpdate(
      {
        parkingId,

        status: SLOT_STATUS.AVAILABLE,

        isActive: true,

        supportedVehicleTypes: vehicleType,
      },
      {
        $set: {
          status: SLOT_STATUS.RESERVED,
          reservedUntil,
        },
      },
      {
        new: true,
        sort: {
          displayOrder: 1,
        },
      },
    );
  }

  async occupy(slotId: string) {
    return ParkingSlot.findByIdAndUpdate(
      slotId,
      {
        status: SLOT_STATUS.OCCUPIED,
        reservedUntil: null,
      },
      {
        new: true,
      },
    );
  }
  async finalizeReservation(slotId: string, reservedUntil: Date) {
    return ParkingSlot.findOneAndUpdate(
      {
        _id: slotId,
        status: SLOT_STATUS.RESERVED,
      },
      {
        reservedUntil,
      },
      {
        new: true,
      },
    );
  }

  async confirmReservation(slotId: string) {
    return ParkingSlot.findOneAndUpdate(
      {
        _id: slotId,
        status: SLOT_STATUS.RESERVED,
      },
      {
        $set: {
          reservedUntil: null,
        },
      },
      {
        new: true,
      },
    );
  }
  async release(slotId: string) {
    return ParkingSlot.findByIdAndUpdate(
      slotId,
      {
        status: SLOT_STATUS.AVAILABLE,
        reservedUntil: null,
      },
      {
        new: true,
      },
    );
  }

  async update(id: string, data: Partial<IParkingSlot>) {
    return ParkingSlot.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async updateStatus(id: string, status: SlotStatus) {
    return ParkingSlot.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );
  }
  async releaseExpiredReservations() {
    return ParkingSlot.updateMany(
      {
        status: SLOT_STATUS.RESERVED,
        reservedUntil: {
          $lte: new Date(),
        },
      },
      {
        $set: {
          status: SLOT_STATUS.AVAILABLE,
          reservedUntil: null,
        },
      },
    );
  }
  async delete(id: string) {
    return ParkingSlot.findByIdAndDelete(id);
  }
}

export default new ParkingSlotRepository();
