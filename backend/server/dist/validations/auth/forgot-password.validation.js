import { z } from "zod";
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
});
//# sourceMappingURL=forgot-password.validation.js.map