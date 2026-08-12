import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
import { Types } from "mongoose";
import { PARKING_STATUS } from "../../constants/parking.js";
class ParkingService {
    async createParking(ownerId, data) {
        if (!Types.ObjectId.isValid(ownerId)) {
            throw new ApiError(400, "Invalid owner ID.");
        }
        const parking = await parkingRepository.create({
            ownerId: new Types.ObjectId(ownerId),
            ...data,
            status: PARKING_STATUS.PENDING,
            isActive: true,
        });
        return parking;
    }
    async getMyParkings(ownerId) {
        return parkingRepository.findByOwner(ownerId);
    }
    async approveParking(parkingId) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        if (parking.status === PARKING_STATUS.APPROVED) {
            throw new ApiError(400, "Parking is already approved.");
        }
        return parkingRepository.approve(parkingId);
    }
    async rejectParking(parkingId) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        if (parking.status === PARKING_STATUS.REJECTED) {
            throw new ApiError(400, "Parking is already rejected.");
        }
        return parkingRepository.reject(parkingId);
    }
    async getParkingById(id) {
        const parking = await parkingRepository.findById(id);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        return parking;
    }
    async updateParking(ownerId, parkingId, data) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to modify this parking.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is inactive.");
        }
        const { bookingModes, pricing, ...basicData } = data;
        const updateData = {
            ...basicData,
        };
        /*
         * Merge booking modes with existing values
         */
        if (bookingModes) {
            updateData.bookingModes = {
                hourly: bookingModes.hourly ??
                    parking.bookingModes.hourly,
                daily: bookingModes.daily ??
                    parking.bookingModes.daily,
                monthly: bookingModes.monthly ??
                    parking.bookingModes.monthly,
            };
        }
        /*
         * Merge pricing with existing values
         */
        if (pricing) {
            updateData.pricing = {
                currency: pricing.currency ??
                    parking.pricing.currency,
                twoWheeler: {
                    ...parking.pricing.twoWheeler,
                    ...(pricing.twoWheeler ?? {}),
                },
                fourWheeler: {
                    ...parking.pricing.fourWheeler,
                    ...(pricing.fourWheeler ?? {}),
                },
                vanMinibus: {
                    ...parking.pricing.vanMinibus,
                    ...(pricing.vanMinibus ?? {}),
                },
                heavyVehicle: {
                    ...parking.pricing.heavyVehicle,
                    ...(pricing.heavyVehicle ?? {}),
                },
            };
        }
        const updatedParking = await parkingRepository.update(parkingId, updateData);
        return updatedParking;
    }
    async deactivateParking(ownerId, parkingId) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        if (parking.ownerId.toString() !== ownerId) {
            throw new ApiError(403, "You are not authorized to modify this parking.");
        }
        if (!parking.isActive) {
            throw new ApiError(400, "Parking is already inactive.");
        }
        return parkingRepository.deactivate(parkingId);
    }
}
export default new ParkingService();
//# sourceMappingURL=parking.service.js.map