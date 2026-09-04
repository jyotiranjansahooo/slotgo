import ParkingSlot, { IParkingSlot } from "../models/ParkingSlot.js";

import { SlotStatus } from "../constants/slot.js";

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
      isActive: true,
      supportedVehicleTypes: vehicleType,
      $expr: {
        $gt: [
          {
            $subtract: [
              "$capacity",
              {
                $add: ["$occupiedCount", "$reservedCount"],
              },
            ],
          },
          0,
        ],
      },
    }).sort({
      displayOrder: 1,
    });
  }

  async findAvailable(parkingId: string) {
    return ParkingSlot.find({
      parkingId,
      isActive: true,
      $expr: {
        $gt: [
          {
            $subtract: [
              "$capacity",
              {
                $add: ["$occupiedCount", "$reservedCount"],
              },
            ],
          },
          0,
        ],
      },
    }).sort({
      displayOrder: 1,
    });
  }

  async findFirstAvailable(parkingId: string, vehicleType: VehicleType) {
    return ParkingSlot.findOne({
      parkingId,
      isActive: true,
      supportedVehicleTypes: vehicleType,
      $expr: {
        $gt: [
          {
            $subtract: [
              "$capacity",
              {
                $add: ["$occupiedCount", "$reservedCount"],
              },
            ],
          },
          0,
        ],
      },
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
        isActive: true,
        supportedVehicleTypes: vehicleType,
        $expr: {
          $gt: [
            {
              $subtract: [
                "$capacity",
                {
                  $add: ["$occupiedCount", "$reservedCount"],
                },
              ],
            },
            0,
          ],
        },
      },
      {
        $inc: {
          reservedCount: 1,
        },
        $set: {
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
    return ParkingSlot.findOneAndUpdate(
      {
        _id: slotId,
        $expr: {
          $gt: [
            {
              $subtract: [
                "$capacity",
                {
                  $add: ["$occupiedCount", "$reservedCount"],
                },
              ],
            },
            0,
          ],
        },
      },
      {
        $inc: {
          occupiedCount: 1,
        },
        $set: {
          reservedUntil: null,
        },
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
        reservedCount: {
          $gt: 0,
        },
      },
      {
        $set: {
          reservedUntil,
        },
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
        reservedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          reservedCount: -1,
        },
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
    return ParkingSlot.findOneAndUpdate(
      {
        _id: slotId,
        reservedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          reservedCount: -1,
        },
        $set: {
          reservedUntil: null,
        },
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
        reservedCount: {
          $gt: 0,
        },
        reservedUntil: {
          $lte: new Date(),
        },
      },
      {
        $set: {
          reservedCount: 0,
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
