import { z } from "zod";
export const updateReviewSchema = z
    .object({
    rating: z
        .number()
        .int("Rating must be an integer.")
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5.")
        .optional(),
    comment: z
        .string()
        .trim()
        .max(1000, "Comment cannot exceed 1000 characters.")
        .optional(),
})
    .refine((data) => data.rating !== undefined ||
    data.comment !== undefined, {
    message: "At least one field must be provided.",
});
//# sourceMappingURL=update.validation.js.map