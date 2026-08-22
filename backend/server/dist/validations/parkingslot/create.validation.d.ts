import { z } from "zod";
export declare const createParkingSlotSchema: z.ZodObject<{
    slotNumber: z.ZodString;
    floor: z.ZodDefault<z.ZodString>;
    supportedVehicleTypes: z.ZodArray<z.ZodEnum<{
        fourWheeler: "fourWheeler";
        heavyVehicle: "heavyVehicle";
        twoWheeler: "twoWheeler";
        vanMinibus: "vanMinibus";
    }>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateParkingSlotInput = z.infer<typeof createParkingSlotSchema>;
