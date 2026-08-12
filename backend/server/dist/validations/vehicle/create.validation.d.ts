import { z } from "zod";
export declare const createVehicleSchema: z.ZodObject<{
    vehicleType: z.ZodEnum<{
        fourWheeler: "fourWheeler";
        heavyVehicle: "heavyVehicle";
        twoWheeler: "twoWheeler";
        vanMinibus: "vanMinibus";
    }>;
    registrationNumber: z.ZodString;
    brand: z.ZodString;
    vehicleModel: z.ZodString;
    color: z.ZodString;
}, z.core.$strip>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
