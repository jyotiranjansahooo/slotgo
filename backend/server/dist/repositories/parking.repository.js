import { Types } from "mongoose";
import Parking from "../models/Parking.js";
class ParkingRepository {
    async create(data) {
        return Parking.create(data);
    }
    async findById(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findById(id).lean();
    }
    async findApprovedById(id) {
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
    async findByOwner(ownerId) {
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
    async update(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
    }
    // DEACTIVATE / SOFT DELETE
    async deactivate(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            isActive: false,
            deletedAt: new Date(),
            isTemporarilyClosed: false,
            temporaryClosedReason: "",
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    // HARD DELETE
    //
    // Keep this method available, but owner deletion should use
    // deactivate() so existing bookings/reviews/history are not
    // destroyed.
    //
    async delete(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndDelete(id);
    }
    // TEMPORARILY CLOSE
    async temporarilyClose(id, reason = "") {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            isTemporarilyClosed: true,
            temporaryClosedReason: reason.trim(),
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    // REOPEN
    async reopen(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            isTemporarilyClosed: false,
            temporaryClosedReason: "",
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    async approve(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            status: "approved",
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    async reject(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            status: "rejected",
        }, {
            new: true,
            runValidators: true,
        }).lean();
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
    async searchParkings(filters) {
        const query = {
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
//# sourceMappingURL=parking.repository.js.map