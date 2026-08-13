import { z } from "zod";
export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number.")
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot be greater than 5.")
        .optional(),
    comment: z
        .string()
        .trim()
        .max(1000, "Comment cannot exceed 1000 characters.")
        .optional(),
});
//# sourceMappingURL=update.validation.js.map