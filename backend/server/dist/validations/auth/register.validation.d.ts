import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phoneNumber: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    role: z.ZodEnum<{
        driver: "driver";
        parkingOwner: "parkingOwner";
    }>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
