import { z } from "zod";
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
