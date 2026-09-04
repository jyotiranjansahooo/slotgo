import { z } from "zod";
export declare const createBookingCheckoutSchema: z.ZodObject<{
    parkingId: z.ZodString;
    vehicleId: z.ZodString;
    bookingMode: z.ZodEnum<{
        [x: string]: string;
    }>;
    startTime: z.ZodCoercedDate<unknown>;
    endTime: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export type CreateBookingCheckoutInput = z.infer<typeof createBookingCheckoutSchema>;
