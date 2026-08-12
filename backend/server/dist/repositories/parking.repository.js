import Parking from "../models/Parking.js";
class ParkingRepository {
    async create(data) {
        return Parking.create(data);
    }
    async findById(id) {
        return Parking.findById(id);
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
}
export default new ParkingRepository();
//# sourceMappingURL=parking.repository.js.map