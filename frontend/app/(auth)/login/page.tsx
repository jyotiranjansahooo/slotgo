"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),

  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      setServerError("");

      const user = await login(data);

      if (user.role === "driver") {
        router.replace("/");
        return;
      }

      if (user.role === "parkingOwner") {
        router.replace("/owner");
        return;
      }

      if (user.role === "admin") {
        router.replace("/admin");
        return;
      }

      setServerError("Unknown user role.");
    } catch (error: unknown) {
      console.error("Login error:", error);

      setServerError(
        getApiErrorMessage(error) || "Unable to sign in. Please try again.",
      );
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f7ef] px-4 py-6 text-zinc-900">
      <div className="absolute left-[8%] top-[18%] h-16 w-16 rounded-full border border-[#16a34a]/40 bg-[#16a34a]/10" />
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#16a34a]/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#16a34a]/25 blur-3xl" />

      <div className="absolute right-[12%] top-[12%] h-10 w-10 rounded-full bg-[#16a34a]/20" />

      <div className="absolute bottom-[15%] left-[12%] h-8 w-8 rounded-full bg-[#16a34a]/15" />

      <div className="absolute bottom-[10%] right-[20%] h-20 w-20 rounded-full border border-black/5 bg-[#16a34a]/30" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#16a34a 3px, transparent 2px), linear-gradient(90deg, #16a34a 2px, transparent 2px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-white/5" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2rem] border border-white/80 bg-[#f8f7ef]/95 p-6 shadow-[0_30px_80px_rgba(31,41,55,0.20)] backdrop-blur-2xl sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16a34a] text-white shadow-lg shadow-green-600/20 transition group-hover:scale-105">
                <ShieldCheck size={19} strokeWidth={2.5} />
              </div>

              <span className="text-lg font-bold tracking-tight">SlotGo</span>
            </button>

            <div className="rounded-full border border-green-600/15 bg-green-600/10 px-3 py-1 text-[11px] font-semibold text-green-700">
              Secure Login
            </div>
          </div>

          {/* HEADING */}

          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Welcome back
            </h1>

            <p className="mt-1.5 text-sm leading-5 text-zinc-500">
              Sign in to continue to your SlotGo account.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-zinc-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-white/80 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                      : "border-zinc-200 focus:border-[#16a34a] focus:ring-[#16a34a]/15"
                  }`}
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-zinc-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-white/80 py-3 pl-10 pr-11 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                      : "border-zinc-200 focus:border-[#16a34a] focus:ring-[#16a34a]/15"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={isSubmitting}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* SERVER ERROR */}
            {serverError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
                {serverError}
              </div>
            )}
            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#15803d] hover:shadow-xl hover:shadow-green-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign in
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />

              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <GoogleLoginButton/>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />

            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              New to SlotGo?
            </span>

            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <button
            type="button"
            onClick={() => router.push("/register")}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600/20 bg-green-600/5 py-3 text-sm font-semibold text-green-700 transition hover:border-green-600/40 hover:bg-green-600/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={16} />
            Create a new account
          </button>

          <p className="mt-5 text-center text-[11px] leading-5 text-zinc-400">
            By continuing, you agree to SlotGo&apos;s terms and privacy policy.
          </p>
        </div>

        {/* BOTTOM TAGLINE */}

        <p className="mt-4 text-center text-xs font-medium text-zinc-600">
          Find your space. Park with confidence.
        </p>
      </div>
    </main>
  );
}
