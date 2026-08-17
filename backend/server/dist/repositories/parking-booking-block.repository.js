import ParkingBookingBlock from "../models/ParkingBookingBlock.js";
class ParkingBookingBlockRepository {
    async create(data) {
        return ParkingBookingBlock.create(data);
    }
    async findById(id) {
        return ParkingBookingBlock.findById(id);
    }
    async findByParking(parkingId) {
        return ParkingBookingBlock.find({
            parkingId,
            endTime: {
                $gt: new Date(),
            },
        }).sort({
            startTime: 1,
        });
    }
    async findOverlapping(parkingId, startTime, endTime) {
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
    async delete(id) {
        return ParkingBookingBlock.findByIdAndDelete(id);
    }
}
export default new ParkingBookingBlockRepository();
//# sourceMappingURL=parking-booking-block.repository.js.map