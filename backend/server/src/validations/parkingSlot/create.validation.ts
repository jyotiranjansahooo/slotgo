import { z } from "zod";

import { VEHICLE_TYPE_VALUES } from "../../constants/vehicle.js";

export const createParkingSlotSchema = z.object({
  slotNumber: z
    .string()
    .trim()
    .min(1, "Slot number is required")
    .max(20, "Slot number cannot exceed 20 characters")
    .toUpperCase(),

  floor: z
    .string()
    .trim()
    .min(1, "Floor is required")
    .max(30, "Floor cannot exceed 30 characters")
    .default("Ground"),

  supportedVehicleTypes: z
    .array(z.enum(VEHICLE_TYPE_VALUES))
    .min(1, "At least one vehicle type is required"),

  displayOrder: z
    .number()
    .int()
    .min(0)
    .default(0),

  notes: z
    .string()
    .trim()
    .max(200, "Notes cannot exceed 200 characters")
    .optional(),
});

export type CreateParkingSlotInput = z.infer<
  typeof createParkingSlotSchema
>;