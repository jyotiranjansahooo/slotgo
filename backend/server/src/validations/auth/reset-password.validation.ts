import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address."),

    newPassword: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters long.",
      )
      .max(
        100,
        "Password cannot exceed 100 characters.",
      ),

    confirmPassword: z
      .string()
      .min(
        8,
        "Confirm password must be at least 8 characters long.",
      )
      .max(
        100,
        "Confirm password cannot exceed 100 characters.",
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        "New password and confirm password do not match.",
      path: ["confirmPassword"],
    },
  );

export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;