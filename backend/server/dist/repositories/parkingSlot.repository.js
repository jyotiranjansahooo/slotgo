import ParkingSlot from "../models/ParkingSlot.js";
class ParkingSlotRepository {
    async create(data) {
        return ParkingSlot.create(data);
    }
    async findById(id) {
        return ParkingSlot.findById(id);
    }
    async findByParkingAndSlotNumber(parkingId, slotNumber) {
        return ParkingSlot.findOne({
            parkingId,
            slotNumber: slotNumber.toUpperCase(),
        });
    }
    async findByParking(parkingId) {
        return ParkingSlot.find({
            parkingId,
        }).sort({
            displayOrder: 1,
        });
    }
    async findAvailableByVehicleType(parkingId, vehicleType) {
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
    async findAvailable(parkingId) {
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
    async findFirstAvailable(parkingId, vehicleType) {
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
    async reserve(parkingId, vehicleType, reservedUntil) {
        return ParkingSlot.findOneAndUpdate({
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
        }, {
            $inc: {
                reservedCount: 1,
            },
            $set: {
                reservedUntil,
            },
        }, {
            new: true,
            sort: {
                displayOrder: 1,
            },
        });
    }
    async occupy(slotId) {
        return ParkingSlot.findOneAndUpdate({
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
        }, {
            $inc: {
                occupiedCount: 1,
            },
            $set: {
                reservedUntil: null,
            },
        }, {
            new: true,
        });
    }
    async finalizeReservation(slotId, reservedUntil) {
        return ParkingSlot.findOneAndUpdate({
            _id: slotId,
            reservedCount: {
                $gt: 0,
            },
        }, {
            $set: {
                reservedUntil,
            },
        }, {
            new: true,
        });
    }
    async confirmReservation(slotId) {
        return ParkingSlot.findOneAndUpdate({
            _id: slotId,
            reservedCount: {
                $gt: 0,
            },
        }, {
            $inc: {
                reservedCount: -1,
            },
            $set: {
                reservedUntil: null,
            },
        }, {
            new: true,
        });
    }
    async release(slotId) {
        return ParkingSlot.findOneAndUpdate({
            _id: slotId,
            reservedCount: {
                $gt: 0,
            },
        }, {
            $inc: {
                reservedCount: -1,
            },
            $set: {
                reservedUntil: null,
            },
        }, {
            new: true,
        });
    }
    async update(id, data) {
        return ParkingSlot.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    async updateStatus(id, status) {
        return ParkingSlot.findByIdAndUpdate(id, {
            status,
        }, {
            new: true,
        });
    }
    async releaseExpiredReservations() {
        return ParkingSlot.updateMany({
            reservedCount: {
                $gt: 0,
            },
            reservedUntil: {
                $lte: new Date(),
            },
        }, {
            $set: {
                reservedCount: 0,
                reservedUntil: null,
            },
        });
    }
    async delete(id) {
        return ParkingSlot.findByIdAndDelete(id);
    }
}
export default new ParkingSlotRepository();
//# sourceMappingURL=parkingSlot.repository.js.map