import { z } from "zod";
export declare const updateParkingSlotSchema: z.ZodObject<{
    slotNumber: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodString>;
    supportedVehicleTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        fourWheeler: "fourWheeler";
        heavyVehicle: "heavyVehicle";
        twoWheeler: "twoWheeler";
        vanMinibus: "vanMinibus";
    }>>>;
    displayOrder: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
