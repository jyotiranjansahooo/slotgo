import { z } from "zod";
export declare const createParkingBookingBlockSchema: z.ZodObject<{
    startTime: z.ZodCoercedDate<unknown>;
    endTime: z.ZodCoercedDate<unknown>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateParkingBookingBlockInput = z.infer<typeof createParkingBookingBlockSchema>;
