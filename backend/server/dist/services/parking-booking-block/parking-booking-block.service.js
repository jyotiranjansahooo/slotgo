import ApiError from "../../utils/ApiError.js";
import parkingBookingBlockRepository from "../../repositories/parking-booking-block.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
class ParkingBookingBlockService {
    async create(ownerId, parkingId, data) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You do not own this parking.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        if (data.startTime < new Date()) {
            throw new ApiError(400, "Booking pause cannot start in the past.");
        }
        const overlappingBlock = await parkingBookingBlockRepository.findOverlapping(parkingId, data.startTime, data.endTime);
        if (overlappingBlock) {
            throw new ApiError(409, "This parking already has a booking pause during the selected time.");
        }
        return parkingBookingBlockRepository.create({
            parkingId,
            createdBy: ownerId,
            startTime: data.startTime,
            endTime: data.endTime,
            reason: data.reason,
        });
    }
    async getMyBlocks(ownerId, parkingId) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You do not own this parking.");
        }
        return parkingBookingBlockRepository.findByParking(parkingId);
    }
    async delete(ownerId, blockId) {
        const block = await parkingBookingBlockRepository.findById(blockId);
        if (!block) {
            throw new ApiError(404, "Booking pause not found.");
        }
        const parking = await parkingRepository.findById(block.parkingId.toString());
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You do not own this parking.");
        }
        return parkingBookingBlockRepository.delete(blockId);
    }
}
export default new ParkingBookingBlockService();
//# sourceMappingURL=parking-booking-block.service.js.map