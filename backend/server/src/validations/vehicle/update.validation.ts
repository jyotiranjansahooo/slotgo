import { z } from "zod";
import { VEHICLE_TYPES } from "../../constants/vehicle.js";

export const updateVehicleSchema = z.object({
  vehicleType: z
    .enum([
      VEHICLE_TYPES.TWO_WHEELER,
      VEHICLE_TYPES.FOUR_WHEELER,
      VEHICLE_TYPES.VAN_MINIBUS,
      VEHICLE_TYPES.HEAVY_VEHICLE,
    ])
    .optional(),

  brand: z
    .string()
    .trim()
    .min(2, "Brand is required")
    .max(40, "Brand cannot exceed 40 characters")
    .optional(),

  vehicleModel: z
    .string()
    .trim()
    .min(1, "Vehicle model is required")
    .max(40, "Vehicle model cannot exceed 40 characters")
    .optional(),

  color: z
    .string()
    .trim()
    .min(2, "Color is required")
    .max(20, "Color cannot exceed 20 characters")
    .optional(),

  isDefault: z.boolean().optional(),
});

export type UpdateVehicleInput = z.infer<
  typeof updateVehicleSchema
>;