"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

import {
  forgotPassword,
  resetPassword,
  verifyPasswordResetOtp,
} from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ForgotPasswordStep = "email" | "otp" | "password" | "success";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [forgotPasswordStep, setForgotPasswordStep] =
    useState<ForgotPasswordStep>("email");

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

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

  const openForgotPassword = (): void => {
    setServerError("");
    setForgotPasswordMessage("");
    setForgotPasswordEmail("");
    setForgotPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordStep("email");
    setResendCooldown(0);
    setForgotPasswordMode(true);
  };

  const backToLogin = (): void => {
    setServerError("");
    setForgotPasswordMessage("");
    setForgotPasswordMode(false);
    setForgotPasswordStep("email");
    setForgotPasswordEmail("");
    setForgotPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResendCooldown(0);
  };

  const handleForgotPasswordEmail = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setServerError("");
    setForgotPasswordMessage("");

    const normalizedEmail = forgotPasswordEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setServerError("Please enter your email address.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setServerError("Please enter a valid email address.");
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await forgotPassword({
        email: normalizedEmail,
      });

      setForgotPasswordEmail(normalizedEmail);
      setForgotPasswordOtp("");

      setForgotPasswordMessage(
        response.message || "A verification code has been sent to your email.",
      );

      setForgotPasswordStep("otp");
      setResendCooldown(RESEND_COOLDOWN);
    } catch (error: unknown) {
      console.error("Forgot password error:", error);

      setServerError(
        getApiErrorMessage(error) || "Unable to send verification code.",
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setServerError("");
    setForgotPasswordMessage("");

    const cleanOtp = forgotPasswordOtp.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (cleanOtp.length !== OTP_LENGTH) {
      setServerError("Please enter the 6-digit verification code.");
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await verifyPasswordResetOtp({
        email: forgotPasswordEmail,
        otp: cleanOtp,
      });

      if (!response.data?.verified) {
        setServerError("Unable to verify the OTP. Please try again.");
        return;
      }

      setForgotPasswordMessage(
        response.message || "OTP verified successfully.",
      );

      setForgotPasswordStep("password");
    } catch (error: unknown) {
      console.error("Password reset OTP verification error:", error);

      setServerError(getApiErrorMessage(error) || "Unable to verify the OTP.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setServerError("");
    setForgotPasswordMessage("");

    if (newPassword.length < 8) {
      setServerError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setServerError("New password and confirm password do not match.");
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await resetPassword({
        email: forgotPasswordEmail,
        newPassword,
        confirmPassword,
      });

      setForgotPasswordMessage(
        response.message || "Password reset successfully.",
      );

      setNewPassword("");
      setConfirmPassword("");

      setForgotPasswordStep("success");
    } catch (error: unknown) {
      console.error("Reset password error:", error);

      setServerError(getApiErrorMessage(error) || "Unable to reset password.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    if (resendCooldown > 0 || forgotPasswordLoading) {
      return;
    }

    setServerError("");
    setForgotPasswordMessage("");
    setForgotPasswordLoading(true);

    try {
      const response = await forgotPassword({
        email: forgotPasswordEmail,
      });

      setForgotPasswordOtp("");

      setForgotPasswordMessage(
        response.message ||
          "A new verification code has been sent to your email.",
      );

      setResendCooldown(RESEND_COOLDOWN);
    } catch (error: unknown) {
      console.error("Resend password reset OTP error:", error);

      setServerError(
        getApiErrorMessage(error) || "Unable to resend verification code.",
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordBack = (): void => {
    setServerError("");
    setForgotPasswordMessage("");

    if (forgotPasswordStep === "otp") {
      setForgotPasswordStep("email");
      setForgotPasswordOtp("");
      return;
    }

    if (forgotPasswordStep === "password") {
      setForgotPasswordStep("otp");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }

    if (forgotPasswordStep === "success") {
      backToLogin();
      return;
    }

    backToLogin();
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
              {forgotPasswordMode ? "Password Recovery" : "Secure Login"}
            </div>
          </div>

          {!forgotPasswordMode && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                  Welcome back
                </h1>

                <p className="mt-1.5 text-sm leading-5 text-zinc-500">
                  Sign in to continue to your SlotGo account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    disabled={isSubmitting}
                    className="text-xs font-semibold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                {serverError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
                    {serverError}
                  </div>
                )}

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

                <GoogleLoginButton />
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
                By continuing, you agree to SlotGo&apos;s terms and privacy
                policy.
              </p>
            </>
          )}

          {forgotPasswordMode && (
            <>
              {forgotPasswordStep === "email" && (
                <ForgotPasswordEmailStep
                  email={forgotPasswordEmail}
                  setEmail={setForgotPasswordEmail}
                  loading={forgotPasswordLoading}
                  error={serverError}
                  message={forgotPasswordMessage}
                  onSubmit={handleForgotPasswordEmail}
                  onBack={backToLogin}
                />
              )}

              {forgotPasswordStep === "otp" && (
                <ForgotPasswordOtpStep
                  email={forgotPasswordEmail}
                  otp={forgotPasswordOtp}
                  setOtp={setForgotPasswordOtp}
                  loading={forgotPasswordLoading}
                  error={serverError}
                  message={forgotPasswordMessage}
                  resendCooldown={resendCooldown}
                  onSubmit={handleVerifyForgotPasswordOtp}
                  onResend={handleResendOtp}
                  onBack={handleForgotPasswordBack}
                />
              )}

              {forgotPasswordStep === "password" && (
                <ForgotPasswordPasswordStep
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  loading={forgotPasswordLoading}
                  error={serverError}
                  message={forgotPasswordMessage}
                  onSubmit={handleResetPassword}
                  onBack={handleForgotPasswordBack}
                />
              )}

              {forgotPasswordStep === "success" && (
                <ForgotPasswordSuccessStep
                  message={forgotPasswordMessage}
                  onLogin={backToLogin}
                />
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs font-medium text-zinc-600">
          Find your space. Park with confidence.
        </p>
      </div>
    </main>
  );
}

function ForgotPasswordEmailStep({
  email,
  setEmail,
  loading,
  error,
  message,
  onSubmit,
  onBack,
}: {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  error: string;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900"
      >
        <ArrowLeft size={14} />
        Back to login
      </button>

      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 text-green-700">
          <KeyRound size={26} />
        </div>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Enter your registered email and we&apos;ll send you a verification
          code.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium leading-5 text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="forgot-email"
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
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#16a34a] focus:bg-white focus:ring-2 focus:ring-[#16a34a]/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Send OTP
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </>
  );
}

function ForgotPasswordOtpStep({
  email,
  otp,
  setOtp,
  loading,
  error,
  message,
  resendCooldown,
  onSubmit,
  onResend,
  onBack,
}: {
  email: string;
  otp: string;
  setOtp: (value: string) => void;
  loading: boolean;
  error: string;
  message: string;
  resendCooldown: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900 disabled:opacity-40"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 text-green-700">
          <ShieldCheck size={26} />
        </div>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Enter the 6-digit code sent to
        </p>

        <p className="mt-1 text-sm font-semibold text-zinc-700">{email}</p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium leading-5 text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="forgot-otp"
            className="mb-1.5 block text-xs font-semibold text-zinc-700"
          >
            Verification code
          </label>

          <input
            id="forgot-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={(event) => {
              const value = event.target.value
                .replace(/\D/g, "")
                .slice(0, OTP_LENGTH);

              setOtp(value);
            }}
            placeholder="000000"
            disabled={loading}
            className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3.5 text-center text-2xl font-bold tracking-[0.45em] text-zinc-900 outline-none transition placeholder:text-zinc-300 focus:border-[#16a34a] focus:bg-white focus:ring-2 focus:ring-[#16a34a]/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== OTP_LENGTH}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify OTP
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-900 disabled:opacity-40"
          >
            Change email
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={loading || resendCooldown > 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            <RefreshCw size={13} />

            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    </>
  );
}

function ForgotPasswordPasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  error,
  message,
  onSubmit,
  onBack,
}: {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  loading: boolean;
  error: string;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900 disabled:opacity-40"
      >
        <ArrowLeft size={14} />
        Back to OTP
      </button>

      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 text-green-700">
          <LockKeyhole size={26} />
        </div>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create new password
        </h1>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Your email is verified. Create a new password for your account.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium leading-5 text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <PasswordField
          id="new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          onToggle={() => setShowNewPassword(!showNewPassword)}
          disabled={loading}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={loading}
          autoComplete="new-password"
        />

        <p className="text-xs leading-5 text-zinc-400">
          Your password must contain at least 8 characters.
        </p>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              <KeyRound size={16} />
              Reset Password
            </>
          )}
        </button>
      </form>
    </>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-zinc-700"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          disabled={disabled}
          className="w-full rounded-xl border border-zinc-200 bg-white/80 py-3 pl-10 pr-11 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-300 focus:border-[#16a34a] focus:bg-white focus:ring-2 focus:ring-[#16a34a]/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 disabled:opacity-40"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordSuccessStep({
  message,
  onLogin,
}: {
  message: string;
  onLogin: () => void;
}) {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600/10 text-green-700">
          <CheckCircle2 size={30} />
        </div>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Password changed</h1>

        <p className="mt-2 text-sm leading-5 text-zinc-500">
          Your password has been reset successfully. You can now login using
          your new password.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
        <p className="text-xs font-medium leading-5 text-green-700">
          {message || "Your new password is ready to use."}
        </p>
      </div>

      <button
        type="button"
        onClick={onLogin}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-[#15803d]"
      >
        Go to Login
        <ArrowRight size={16} />
      </button>
    </>
  );
}
