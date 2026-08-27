import { Types } from "mongoose";
import Parking from "../models/Parking.js";
class ParkingRepository {
    // =========================================================
    // CREATE
    // =========================================================
    async create(data) {
        return Parking.create(data);
    }
    // =========================================================
    // FIND BY ID
    // =========================================================
    async findById(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findById(id).lean();
    }
    // =========================================================
    // FIND APPROVED PARKING BY ID
    // =========================================================
    async findApprovedById(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findOne({
            _id: new Types.ObjectId(id),
            status: "approved",
            isActive: true,
        }).lean();
    }
    // =========================================================
    // FIND OWNER PARKINGS
    // =========================================================
    async findByOwner(ownerId) {
        console.log("\n==========================================");
        console.log("PARKING REPOSITORY: findByOwner()");
        console.log("Received ownerId:", ownerId);
        console.log("ownerId type:", typeof ownerId);
        console.log("ObjectId valid:", Types.ObjectId.isValid(ownerId));
        if (!Types.ObjectId.isValid(ownerId)) {
            console.log("❌ INVALID OWNER ID");
            console.log("==========================================\n");
            return [];
        }
        const objectOwnerId = new Types.ObjectId(ownerId);
        console.log("ObjectId being queried:", objectOwnerId);
        console.log("Database name:", Parking.db.name);
        console.log("Collection:", Parking.collection.name);
        // ---------------------------------------------------------
        // DEBUG: Count everything in this collection
        // ---------------------------------------------------------
        const totalCount = await Parking.countDocuments({});
        console.log("Total parking documents:", totalCount);
        // ---------------------------------------------------------
        // DEBUG: Count by owner WITHOUT isActive
        // ---------------------------------------------------------
        const ownerCount = await Parking.countDocuments({
            ownerId: objectOwnerId,
        });
        console.log("Documents with this ownerId:", ownerCount);
        // ---------------------------------------------------------
        // DEBUG: Count by owner + active
        // ---------------------------------------------------------
        const activeOwnerCount = await Parking.countDocuments({
            ownerId: objectOwnerId,
            isActive: true,
        });
        console.log("Documents with ownerId + isActive:true:", activeOwnerCount);
        // ---------------------------------------------------------
        // ACTUAL QUERY
        // ---------------------------------------------------------
        const parkings = await Parking.find({
            ownerId: objectOwnerId,
            isActive: true,
        })
            .sort({
            createdAt: -1,
        })
            .lean();
        console.log("Final parkings found:", parkings.length);
        for (const parking of parkings) {
            console.log({
                id: String(parking._id),
                parkingName: parking.parkingName,
                ownerId: String(parking.ownerId),
                status: parking.status,
                isActive: parking.isActive,
                images: parking.images?.length ?? 0,
            });
        }
        console.log("==========================================\n");
        return parkings;
    }
    // =========================================================
    // FIND ALL
    // =========================================================
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
    async update(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
    }
    // =========================================================
    // DEACTIVATE
    // =========================================================
    async deactivate(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndUpdate(id, {
            isActive: false,
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    // =========================================================
    // DELETE
    // =========================================================
    async delete(id) {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Parking.findByIdAndDelete(id);
    }
    // =========================================================
    // APPROVE
    // =========================================================
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
    // =========================================================
    // REJECT
    // =========================================================
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
    async searchParkings(filters) {
        const query = {
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
//# sourceMappingURL=parking.repository.js.map