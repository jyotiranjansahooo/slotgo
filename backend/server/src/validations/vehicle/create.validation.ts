import { z } from "zod";
import { VEHICLE_TYPES } from "../../constants/vehicle.js";

export const createVehicleSchema = z.object({
  vehicleType: z.enum([
    VEHICLE_TYPES.TWO_WHEELER,
    VEHICLE_TYPES.FOUR_WHEELER,
    VEHICLE_TYPES.VAN_MINIBUS,
    VEHICLE_TYPES.HEAVY_VEHICLE,
  ]),

  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
      "Invalid registration number",
    ),

  manufacturer: z.string().trim().min(2, "Manufacturer is required").max(50),

  vehicleModel: z.string().trim().min(1, "Vehicle model is required").max(50),

  color: z.string().trim().min(2, "Color is required").max(30),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
