"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

import {
  UserPlus,
  Loader2,
  Mail,
  Phone,
  LockKeyhole,
  User,
  Car,
  ArrowRight,
  MapPin,
} from "lucide-react";

import api from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First name must be at least 3 characters.")
      .max(30, "First name is too long.")
      .regex(
        /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
        "First name can contain letters only.",
      ),

    lastName: z
      .string()
      .trim()
      .min(3, "Last name must be at least 3 characters.")
      .max(30, "Last name is too long.")
      .regex(
        /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
        "Last name can contain letters only.",
      ),

    email: z.string().trim().email("Enter a valid email address."),

    phoneNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character.",
      ),

    confirmPassword: z.string().min(8, "Please confirm your password."),

    role: z.enum(["driver", "parkingOwner"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "driver",
    },
  });
  const selectedRole = watch("role");
  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      setServerError("");

      const response = await api.post<RegisterResponse>("/auth/register", data);

      if (response.data.success && response.data.data.requiresVerification) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(response.data.data.email)}`,
        );

        return;
      }

      setServerError(
        response.data.message || "Registration could not be completed.",
      );
    } catch (error: unknown) {
      console.error("Registration error:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              data?: Array<{
                field?: string;
                message?: string;
              }>;
            };
          };
        };

        const responseData = axiosError.response?.data;

        const fieldError = responseData?.data?.find(
          (item) => typeof item?.message === "string",
        );

        if (fieldError?.message) {
          setServerError(fieldError.message);
          return;
        }

        if (typeof responseData?.message === "string") {
          setServerError(responseData.message);
          return;
        }

        setServerError(
          "Registration failed. Please check your information and try again.",
        );

        return;
      }

      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f3e8] px-4 py-6 text-[#181818] sm:px-6">
      {/* ===================================================== */}
      {/* BACKGROUND */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Yellow glow */}

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#facc15]/30 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#facc15]/25 blur-3xl" />

        {/* Decorative bubbles */}

        <div className="absolute left-[8%] top-[18%] h-16 w-16 rounded-full border border-[#facc15]/40 bg-[#facc15]/10" />

        <div className="absolute right-[12%] top-[12%] h-10 w-10 rounded-full bg-[#facc15]/20" />

        <div className="absolute bottom-[15%] left-[12%] h-8 w-8 rounded-full bg-black/5" />

        <div className="absolute bottom-[10%] right-[20%] h-20 w-20 rounded-full border border-black/5" />

        {/* Grid */}

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <div className="relative z-10 w-full max-w-5xl">
        {/* HEADER */}

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#facc15] text-black shadow-sm transition group-hover:scale-105">
              <MapPin size={18} strokeWidth={2.5} />
            </div>

            <span className="text-lg font-black tracking-tight">SlotGo</span>
          </button>

          {/* LOGIN */}

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-black/60 transition hover:text-black"
          >
            Already have an account?
            <span className="ml-1 text-black underline underline-offset-4">
              Login
            </span>
          </button>
        </div>

        <div className="grid overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)] lg:grid-cols-[0.75fr_1.25fr]">
          <div className="relative hidden overflow-hidden bg-[#facc15] p-8 lg:flex lg:flex-col lg:justify-between">
            {/* Decorative circles */}

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/20" />

            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-black/5" />

            <div className="absolute right-10 top-1/2 h-20 w-20 rounded-full bg-white/10" />

            {/* Content */}

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-[#facc15]">
                <Car size={24} strokeWidth={2.2} />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-black/50">
                Welcome to SlotGo
              </p>

              <h1 className="mt-3 max-w-sm text-4xl font-black leading-[1.05] tracking-tight">
                Parking made
                <br />
                simple.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-black/60">
                Create your account and find, reserve, and manage parking
                without the usual hassle.
              </p>
            </div>

            {/* FEATURES */}

            <div className="relative z-10 space-y-3">
              <Feature icon={<MapPin size={16} />} text="Find nearby parking" />

              <Feature icon={<Car size={16} />} text="Manage your vehicles" />

              <Feature
                icon={<LockKeyhole size={16} />}
                text="Secure account verification"
              />
            </div>
          </div>

          {/* FORM SIDE */}

          <div className="p-6 sm:p-8">
            {/* MOBILE TITLE */}

            <div className="mb-5 lg:hidden">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#facc15]">
                <UserPlus size={20} />
              </div>

              <h1 className="text-2xl font-black tracking-tight">
                Create account
              </h1>

              <p className="mt-1 text-xs text-black/45">
                Your parking journey starts here.
              </p>
            </div>

            {/* DESKTOP TITLE */}

            <div className="mb-5 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#facc15]">
                  <UserPlus size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight">
                    Create account
                  </h1>

                  <p className="text-xs text-black/45">
                    Your parking journey starts here.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* NAME */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="First name"
                  type="text"
                  icon={<User size={15} />}
                  error={errors.firstName?.message}
                  {...register("firstName")}
                  placeholder="John"
                  autoComplete="given-name"
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.replace(/[^A-Za-z '-]/g, "");
                  }}
                />

                <InputField
                  label="Last name"
                  type="text"
                  icon={<User size={15} />}
                  error={errors.lastName?.message}
                  {...register("lastName")}
                  placeholder="Doe"
                  autoComplete="family-name"
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.replace(/[^A-Za-z '-]/g, "");
                  }}
                />
              </div>
              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputField
                  label="Email"
                  icon={<Mail size={15} />}
                  error={errors.email?.message}
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <InputField
                  label="Phone"
                  icon={<Phone size={15} />}
                  error={errors.phoneNumber?.message}
                  {...register("phoneNumber")}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Mobile number"
                  autoComplete="tel"
                  onInput={(event) => {
                    event.currentTarget.value = event.currentTarget.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  }}
                />
              </div>
              {/* PASSWORD */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputField
                  label="Password"
                  icon={<LockKeyhole size={15} />}
                  error={errors.password?.message}
                  {...register("password")}
                  type="password"
                  placeholder="SlotGo@123"
                  autoComplete="new-password"
                />

                <InputField
                  label="Confirm password"
                  icon={<LockKeyhole size={15} />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
              {/* PASSWORD INFO */}
              {!errors.password && (
                <div className="rounded-xl bg-[#f7f3e8] px-3 py-2 text-[11px] leading-4 text-black/50">
                  Password: 8+ characters · uppercase · lowercase · number ·
                  special character
                </div>
              )}
              {/* ACCOUNT TYPE */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-xs font-bold text-black/70"
                >
                  Account type
                </label>

                <select
                  id="role"
                  {...register("role")}
                  className="h-10 w-full rounded-xl border border-black/10 bg-[#faf9f5] px-3 text-sm font-medium outline-none transition focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20"
                >
                  <option value="driver">Driver</option>

                  <option value="parkingOwner">Parking Owner</option>
                </select>

                {errors.role && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.role.message}
                  </p>
                )}
              </div>
              {/* SERVER ERROR */}
              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
                  {serverError}
                </div>
              )}
              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Sending verification code...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create account
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
              {/* GOOGLE DIVIDER */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                  OR
                </span>

                <div className="h-px flex-1 bg-black/10" />
              </div>
              <GoogleLoginButton />
            </form>

            <p className="mt-4 text-center text-[11px] leading-5 text-black/40">
              By creating an account, you agree to use SlotGo responsibly and
              securely.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

function InputField({ label, icon, error, ...props }: InputFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-bold text-black/70">
        {label}
      </label>

      <div
        className={`relative flex h-10 items-center rounded-xl border bg-[#faf9f5] transition ${
          error
            ? "border-red-300 focus-within:ring-2 focus-within:ring-red-100"
            : "border-black/10 focus-within:border-[#facc15] focus-within:ring-2 focus-within:ring-[#facc15]/20"
        }`}
      >
        <div className="pointer-events-none ml-3 text-black/35">{icon}</div>

        <input
          {...props}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm font-medium text-black outline-none placeholder:text-black/25"
        />
      </div>

      {error && (
        <p className="mt-1 text-[10px] leading-4 text-red-500">{error}</p>
      )}
    </div>
  );
}

/* ============================================================= */
/* FEATURE */
/* ============================================================= */

interface FeatureProps {
  icon: React.ReactNode;
  text: string;
}

function Feature({ icon, text }: FeatureProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[#facc15]">
        {icon}
      </div>

      <span className="text-xs font-semibold text-black/70">{text}</span>
    </div>
  );
}
