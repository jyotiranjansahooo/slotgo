import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
import parkingSlotRepository from "../../repositories/parkingSlot.repository.js";
class ParkingDiscoveryService {
    // GET ALL APPROVED PARKINGS
    async getApprovedParkings() {
        return parkingRepository.findApprovedParkings();
    }
    // SEARCH PARKINGS
    async searchParkings(filters) {
        return parkingRepository.searchParkings(filters);
    }
    // GET PARKING DETAILS
    async getParkingDetails(parkingId) {
        const parking = await parkingRepository.findApprovedById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        const availableSlots = await parkingSlotRepository.findAvailable(parkingId);
        return {
            parking,
            availability: {
                totalAvailableSlots: availableSlots.length,
                slots: availableSlots,
            },
        };
    }
    // GET AVAILABLE SLOTS BY VEHICLE TYPE
    async getAvailableSlots(parkingId, vehicleType) {
        const parking = await parkingRepository.findApprovedById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        const slots = await parkingSlotRepository.findAvailableByVehicleType(parkingId, vehicleType);
        return {
            parkingId,
            vehicleType,
            totalAvailableSlots: slots.length,
            slots,
        };
    }
}
export default new ParkingDiscoveryService();
//# sourceMappingURL=parkingDiscovery.service.js.map