import { z } from "zod";
export const actionVerificationSchema = z.object({
    action: z.enum(["temporary-close", "delete"]),
});
//# sourceMappingURL=actionVerification.validation.js.map