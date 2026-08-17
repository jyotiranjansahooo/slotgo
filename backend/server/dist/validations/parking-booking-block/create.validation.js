import { z } from "zod";
export const createParkingBookingBlockSchema = z
    .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    reason: z
        .string()
        .trim()
        .max(200, "Reason cannot exceed 200 characters")
        .optional(),
})
    .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});
//# sourceMappingURL=create.validation.js.map