"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2 } from "lucide-react";

import api from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters.")
      .max(30, "First name is too long."),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters.")
      .max(30, "Last name is too long."),

    email: z
      .string()
      .email("Enter a valid email address."),

    phoneNumber: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit phone number.",
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),

    confirmPassword: z
      .string()
      .min(8, "Please confirm your password."),

    role: z.enum(["driver", "parkingOwner"]),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    requiresVerification: boolean;
    email: string;
    message: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "driver",
    },
  });

  const onSubmit = async (
    data: RegisterFormData,
  ): Promise<void> => {
    try {
      setServerError("");

      const response =
        await api.post<RegisterResponse>(
          "/auth/register",
          data,
        );

      if (
        response.data.success &&
        response.data.data.requiresVerification
      ) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            response.data.data.email,
          )}`,
        );

        return;
      }

      setServerError(
        response.data.message ||
          "Registration could not be completed.",
      );
    } catch (error: unknown) {
      console.error("Registration error:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        const message =
          axiosError.response?.data?.message;

        setServerError(
          typeof message === "string"
            ? message
            : "Registration failed. Please try again.",
        );

        return;
      }

      setServerError(
        "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <UserPlus size={22} />
          </div>

          <h1 className="text-3xl font-bold">
            Create account
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Create your SlotGo parking account.
            We&apos;ll send a verification code to your
            email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First name
              </label>

              <input
                {...register("firstName")}
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
              />

              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Last name
              </label>

              <input
                {...register("lastName")}
                type="text"
                placeholder="Last name"
                autoComplete="family-name"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
              />

              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone number
            </label>

            <input
              {...register("phoneNumber")}
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              autoComplete="tel"
              maxLength={10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-400">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              {...register("password")}
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>

            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Account type
            </label>

            <select
              {...register("role")}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            >
              <option value="driver">
                Driver
              </option>

              <option value="parkingOwner">
                Parking Owner
              </option>
            </select>

            {errors.role && (
              <p className="mt-1 text-sm text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Sending verification code...
              </>
            ) : (
              <>
                <UserPlus size={18} />

                Create account
              </>
            )}
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