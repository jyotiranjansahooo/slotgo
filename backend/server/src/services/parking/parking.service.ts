import ApiError from "../../utils/ApiError.js";

import { IParking } from "../../models/Parking.js";

import parkingRepository from "../../repositories/parking.repository.js";

import { Types } from "mongoose";

import { PARKING_STATUS } from "../../constants/parking.js";

import { UpdateParkingInput } from "../../validations/parking/update.validation.js";

import { CreateParkingInput } from "../../validations/parking/create.validation.js";

import { uploadToCloudinary } from "../../utils/cloudinary.js";

import {
  verifyParkingActionVerification,
  type ParkingAction,
} from "./parkingActionVerification.service.js";

class ParkingService {
  /*
  | CREATE PARKING
  */

  async createParking(
    ownerId: string,
    data: CreateParkingInput,
    files: Express.Multer.File[],
  ) {
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
    } catch (error) {
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

      isTemporarilyClosed: false,

      temporaryClosedReason: "",

      deletedAt: null,
    });

    return parking;
  }

  /*
  | GET OWNER PARKINGS
  */

  async getMyParkings(ownerId: string) {
    return parkingRepository.findByOwner(ownerId);
  }

  async getParkingById(id: string) {
    const parking = await parkingRepository.findById(id);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    return parking;
  }

  async getParkingForOwner(ownerId: string, parkingId: string) {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new ApiError(400, "Invalid owner ID.");
    }

    if (!Types.ObjectId.isValid(parkingId)) {
      throw new ApiError(400, "Invalid parking ID.");
    }

    const parking = await parkingRepository.findById(parkingId);

    if (!parking) {
      throw new ApiError(404, "Parking not found.");
    }

    if (parking.ownerId.toString() !== ownerId) {
      throw new ApiError(403, "You are not authorized to access this parking.");
    }

    return parking;
  }

  /*
  | APPROVE PARKING
  */

  async approveParking(parkingId: string) {
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

  /*
  | REJECT PARKING
  */

  async rejectParking(parkingId: string) {
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

  /*
  | UPDATE PARKING
  */

  async updateParking(
    ownerId: string,
    parkingId: string,
    data: UpdateParkingInput,
  ) {
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

    const updateData: Partial<IParking> = {
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

    const updatedParking = await parkingRepository.update(
      parkingId,
      updateData,
    );

    return updatedParking;
  }

  async updateParkingAvailability(
    ownerId: string,
    parkingId: string,
    data: {
      isTemporarilyClosed: boolean;
      reason?: string;
      otp?: string;
    },
  ) {
    const parking = await this.getParkingForOwner(ownerId, parkingId);

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is inactive.");
    }

    if (data.isTemporarilyClosed === false) {
      if (!parking.isTemporarilyClosed) {
        throw new ApiError(400, "Parking is already open.");
      }

      const updatedParking = await parkingRepository.update(parkingId, {
        isTemporarilyClosed: false,

        temporaryClosedReason: "",
      });

      if (!updatedParking) {
        throw new ApiError(500, "Unable to reopen parking.");
      }

      return updatedParking;
    }

    /*
     * TEMPORARY CLOSE
     */

    if (parking.isTemporarilyClosed) {
      throw new ApiError(400, "Parking is already temporarily closed.");
    }

    /*
     * OTP is mandatory for closing.
     */

    if (!data.otp || !/^\d{6}$/.test(data.otp)) {
      throw new ApiError(400, "A valid 6-digit verification code is required.");
    }

    /*
     * Verify OTP.
     */

    await verifyParkingActionVerification({
      ownerId,

      action: "temporary-close" as ParkingAction,

      otp: data.otp,
    });

    /*
     * Update parking.
     */

    const updatedParking = await parkingRepository.update(parkingId, {
      isTemporarilyClosed: true,

      temporaryClosedReason: data.reason?.trim() ?? "",
    });

    if (!updatedParking) {
      throw new ApiError(500, "Unable to temporarily close parking.");
    }

    return updatedParking;
  }

  /*
  | DELETE / DEACTIVATE PARKING
  |
  | This remains a soft delete.
  |
  | The parking is not physically removed from
  | MongoDB.
  |
  | OTP is required.
  |
  */

  async deactivateParking(ownerId: string, parkingId: string, otp: string) {
    const parking = await this.getParkingForOwner(ownerId, parkingId);

    if (!parking.isActive) {
      throw new ApiError(400, "Parking is already inactive.");
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      throw new ApiError(400, "A valid 6-digit verification code is required.");
    }

    /*
     * Verify delete OTP.
     */

    await verifyParkingActionVerification({
      ownerId,

      action: "delete" as ParkingAction,

      otp,
    });

    const deletedParking = await parkingRepository.deactivate(parkingId);

    if (!deletedParking) {
      throw new ApiError(500, "Unable to delete parking.");
    }

    return deletedParking;
  }
}

export default new ParkingService();
