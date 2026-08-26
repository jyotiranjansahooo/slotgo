import ApiError from "../../utils/ApiError.js";
import parkingRepository from "../../repositories/parking.repository.js";
import { Types } from "mongoose";
import { PARKING_STATUS } from "../../constants/parking.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
class ParkingService {
    async createParking(ownerId, data, files) {
        if (!Types.ObjectId.isValid(ownerId)) {
            throw new ApiError(400, "Invalid owner ID.");
        }
        if (!files || files.length < 2) {
            throw new ApiError(400, "At least 2 parking images are required.");
        }
        if (files.length > 5) {
            throw new ApiError(400, "Maximum 5 parking images are allowed.");
        }
        /*
         * Upload images to Cloudinary.
         */
        const uploadedImages = [];
        try {
            for (const file of files) {
                const result = await uploadToCloudinary(file.buffer, "slotgo/parkings");
                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }
        catch (error) {
            console.error("Cloudinary parking image upload failed:", error);
            throw new ApiError(500, "Failed to upload parking images.");
        }
        /*
         * Create parking document.
         */
        const parking = await parkingRepository.create({
            ownerId: new Types.ObjectId(ownerId),
            ...data,
            images: uploadedImages,
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
        if (bookingModes) {
            updateData.bookingModes = {
                hourly: bookingModes.hourly ?? parking.bookingModes.hourly,
                daily: bookingModes.daily ?? parking.bookingModes.daily,
                monthly: bookingModes.monthly ?? parking.bookingModes.monthly,
            };
        }
        if (pricing) {
            updateData.pricing = {
                currency: pricing.currency ?? parking.pricing.currency,
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