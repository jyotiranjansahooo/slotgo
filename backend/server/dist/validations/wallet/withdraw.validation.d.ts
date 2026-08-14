import { z } from "zod";
export declare const withdrawWalletSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
    referenceId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type WithdrawWalletInput = z.infer<typeof withdrawWalletSchema>;
