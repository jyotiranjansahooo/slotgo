import ParkingSlot from "../models/ParkingSlot.js";
import { SLOT_STATUS } from "../constants/slot.js";
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
    async findAvailable(parkingId) {
        return ParkingSlot.find({
            parkingId,
            status: SLOT_STATUS.AVAILABLE,
            isActive: true,
        }).sort({
            displayOrder: 1,
        });
    }
    async findFirstAvailable(parkingId, vehicleType) {
        const now = new Date();
        return ParkingSlot.findOne({
            parkingId,
            isActive: true,
            $or: [
                {
                    status: SLOT_STATUS.AVAILABLE,
                },
                {
                    status: SLOT_STATUS.RESERVED,
                    reservedUntil: {
                        $lte: now,
                    },
                },
            ],
            supportedVehicleTypes: vehicleType,
        }).sort({
            displayOrder: 1,
        });
    }
    async reserve(slotId, reservedUntil, session) {
        const now = new Date();
        return ParkingSlot.findOneAndUpdate({
            _id: slotId,
            isActive: true,
            $or: [
                {
                    status: SLOT_STATUS.AVAILABLE,
                },
                {
                    status: SLOT_STATUS.RESERVED,
                    reservedUntil: {
                        $lte: now,
                    },
                },
            ],
        }, {
            status: SLOT_STATUS.RESERVED,
            reservedUntil,
        }, {
            new: true,
            session,
        });
    }
    async occupy(slotId) {
        return ParkingSlot.findByIdAndUpdate(slotId, {
            status: SLOT_STATUS.OCCUPIED,
            reservedUntil: null,
        }, {
            new: true,
        });
    }
    async finalizeReservation(slotId, reservedUntil) {
        return ParkingSlot.findOneAndUpdate({
            _id: slotId,
            status: SLOT_STATUS.RESERVED,
        }, {
            reservedUntil,
        }, {
            new: true,
        });
    }
    async release(slotId) {
        return ParkingSlot.findByIdAndUpdate(slotId, {
            status: SLOT_STATUS.AVAILABLE,
            reservedUntil: null,
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
    async delete(id) {
        return ParkingSlot.findByIdAndDelete(id);
    }
}
export default new ParkingSlotRepository();
//# sourceMappingURL=parkingSlot.repository.js.map