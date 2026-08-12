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
    brand: z.string().trim().min(2).max(50).optional(),
    vehicleModel: z.string().trim().min(1).max(50).optional(),
    color: z.string().trim().min(2).max(30).optional(),
    isDefault: z.boolean().optional(),
});
//# sourceMappingURL=update.validation.js.map