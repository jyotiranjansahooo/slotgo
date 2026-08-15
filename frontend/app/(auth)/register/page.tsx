"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import api from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters."),

    lastName: z.string().min(2, "Last name must be at least 2 characters."),

    email: z.string().email("Enter a valid email address."),

    phoneNumber: z.string().min(10, "Enter a valid phone number."),

    password: z.string().min(6, "Password must be at least 6 characters."),

    confirmPassword: z.string().min(6, "Please confirm your password."),

    role: z.enum(["driver", "parkingOwner"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "driver",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError("");
      setSuccess("");

      const response = await api.post("/auth/register", data);

      console.log("Registration response:", response.data);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error: unknown) {
  console.error("Registration error:", error);

  if (axios.isAxiosError(error)) {
    const message =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Registration failed.";

    setServerError(message);
  } else {
    setServerError(
      "Something went wrong. Please try again.",
    );
  }
}
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create account</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Create your parking management account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* FIRST NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium">First name</label>

            <input
              {...register("firstName")}
              type="text"
              placeholder="First name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-400">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* LAST NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium">Last name</label>

            <input
              {...register("lastName")}
              type="text"
              placeholder="Last name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-400">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>

            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PHONE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone number
            </label>

            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="9876543210"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-400">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>

            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>

            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ROLE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Account type
            </label>

            <select
              {...register("role")}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
            >
              <option value="driver">Driver</option>

              <option value="parkingOwner">Parking Owner</option>
            </select>

            {errors.role && (
              <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
            )}
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="rounded-lg border border-green-900 bg-green-950/50 p-3 text-sm text-green-300">
              {success}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-white hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}
