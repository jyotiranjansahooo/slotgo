import { z } from "zod";
export const updateUserRoleSchema = z.object({
    role: z.enum(["driver", "parkingOwner", "admin"]),
});
//# sourceMappingURL=updateUserRole.validation.js.map