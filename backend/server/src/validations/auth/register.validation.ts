import { z } from "zod";
import { USER_ROLES } from "../../constants/roles.js";
import { AUTH } from "../../constants/auth.js";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(30, "First name cannot exceed 30 characters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(30, "Last name cannot exceed 30 characters"),

    email: z.string().trim().email("Invalid email address").toLowerCase(),

    phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),

    password: z
      .string()
      .min(
        AUTH.PASSWORD.MIN_LENGTH,
        `Password must be at least ${AUTH.PASSWORD.MIN_LENGTH} characters`,
      )
      .max(
        AUTH.PASSWORD.MAX_LENGTH,
        `Password cannot exceed ${AUTH.PASSWORD.MAX_LENGTH} characters`,
      )
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    confirmPassword: z.string(),

    role: z.enum([USER_ROLES.DRIVER, USER_ROLES.PARKING_OWNER]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
