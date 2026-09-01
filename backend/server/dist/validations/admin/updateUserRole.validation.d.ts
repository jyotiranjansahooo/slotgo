import { z } from "zod";
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        admin: "admin";
        driver: "driver";
        parkingOwner: "parkingOwner";
    }>;
}, z.core.$strip>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
