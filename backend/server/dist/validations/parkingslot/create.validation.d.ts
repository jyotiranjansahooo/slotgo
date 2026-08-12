import { z } from "zod";
export declare const createParkingSlotSchema: z.ZodObject<{
    parkingId: z.ZodString;
    slotNumber: z.ZodString;
    floor: z.ZodDefault<z.ZodString>;
    supportedVehicleTypes: z.ZodArray<z.ZodEnum<{
        fourWheeler: "fourWheeler";
        heavyVehicle: "heavyVehicle";
        twoWheeler: "twoWheeler";
        vanMinibus: "vanMinibus";
    }>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type CreateParkingSlotInput = z.infer<typeof createParkingSlotSchema>;
