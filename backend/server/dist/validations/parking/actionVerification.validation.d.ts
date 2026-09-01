import { z } from "zod";
export declare const actionVerificationSchema: z.ZodObject<{
    action: z.ZodEnum<{
        delete: "delete";
        "temporary-close": "temporary-close";
    }>;
}, z.core.$strip>;
export type ParkingActionVerificationInput = z.infer<typeof actionVerificationSchema>;
