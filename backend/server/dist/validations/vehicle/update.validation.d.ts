import { z } from "zod";
export declare const updateVehicleSchema: z.ZodObject<{
    vehicleType: z.ZodOptional<z.ZodEnum<{
        fourWheeler: "fourWheeler";
        heavyVehicle: "heavyVehicle";
        twoWheeler: "twoWheeler";
        vanMinibus: "vanMinibus";
    }>>;
    brand: z.ZodOptional<z.ZodString>;
    vehicleModel: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
