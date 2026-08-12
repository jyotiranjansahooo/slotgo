import { z } from "zod";
export const checkInSchema = z.object({
    verificationPin: z
        .string()
        .trim()
        .min(4)
        .max(10),
});
//# sourceMappingURL=checkIn.validation.js.map