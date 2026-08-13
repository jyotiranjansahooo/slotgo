import Parking from "../models/Parking.js";
class ParkingRepository {
    async create(data) {
        return Parking.create(data);
    }
    async findById(id) {
        return Parking.findById(id);
    }
    async findApprovedById(id) {
        return Parking.findOne({
            _id: id,
            status: "approved",
            isActive: true,
        });
    }
    async findByOwner(ownerId) {
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
    async update(id, data) {
        return Parking.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    async deactivate(id) {
        return Parking.findByIdAndUpdate(id, {
            isActive: false,
        }, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        return Parking.findByIdAndDelete(id);
    }
    async approve(id) {
        return Parking.findByIdAndUpdate(id, {
            status: "approved",
        }, {
            new: true,
        });
    }
    async reject(id) {
        return Parking.findByIdAndUpdate(id, {
            status: "rejected",
        }, {
            new: true,
        });
    }
    async findApprovedParkings() {
        return Parking.find({
            status: "approved",
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    async searchParkings(filters) {
        const query = {
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
//# sourceMappingURL=parking.repository.js.map