import { z } from "zod";
export const createReviewSchema = z.object({
    bookingId: z
        .string()
        .min(1, "Booking ID is required."),
    rating: z
        .number()
        .int("Rating must be an integer.")
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5."),
    comment: z
        .string()
        .trim()
        .max(1000, "Comment cannot exceed 1000 characters.")
        .optional(),
});
//# sourceMappingURL=create.validation.js.map