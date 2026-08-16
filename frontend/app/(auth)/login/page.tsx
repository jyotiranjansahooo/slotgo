"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/providers/AuthProvider";


import { getApiErrorMessage } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),

  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();

  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");

      const user = await login(data);

      if (user.role === "driver") {
        router.push("/driver");
        return;
      }

      if (user.role === "parkingOwner") {
        router.push("/owner");
        return;
      }

      if (user.role === "admin") {
        router.push("/admin");
        return;
      }

      setServerError("Unknown user role.");
    } catch (error: unknown) {
      console.error("Login error:", error);

      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Login to your parking account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>

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

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>

            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-white"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don`t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-white hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </main>
  );
}
