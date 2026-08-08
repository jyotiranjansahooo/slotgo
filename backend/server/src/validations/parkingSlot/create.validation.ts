import { z } from "zod";

import { VEHICLE_TYPE_VALUES } from "../../constants/vehicle.js";

export const createParkingSlotSchema = z.object({
  parkingId: z.string(),

  slotNumber: z.string().min(1),

  floor: z.string().default("Ground"),

  supportedVehicleTypes: z.array(z.enum(VEHICLE_TYPE_VALUES)),

  displayOrder: z.number().default(0),
});

export type CreateParkingSlotInput = z.infer<typeof createParkingSlotSchema>;
