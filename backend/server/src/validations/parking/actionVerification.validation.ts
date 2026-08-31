import { z } from "zod";

export const actionVerificationSchema = z.object({
  action: z.enum(["temporary-close", "delete"]),
});

export type ParkingActionVerificationInput = z.infer<
  typeof actionVerificationSchema
>;