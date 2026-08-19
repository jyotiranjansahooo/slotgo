import { z } from "zod";

export const resendOtpSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address.")
    .transform((value) => value.trim().toLowerCase()),
});