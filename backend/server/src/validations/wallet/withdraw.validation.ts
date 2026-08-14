import { z } from "zod";

export const withdrawWalletSchema = z.object({
  amount: z
    .coerce
    .number()
    .finite("Amount must be a valid number.")
    .positive("Withdrawal amount must be greater than zero."),

  referenceId: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      300,
      "Description cannot exceed 300 characters.",
    )
    .optional(),
});

export type WithdrawWalletInput =
  z.infer<typeof withdrawWalletSchema>;