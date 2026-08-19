"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { verifyEmailOtp } = useAuth();

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("Verification email is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await verifyEmailOtp({
        email,
        otp,
      });

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

      router.replace("/");
    } catch (error: unknown) {
      console.error("OTP verification error:", error);

      setError(
        getApiErrorMessage(error) ||
          "Invalid or expired verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ============================================================
   * MISSING EMAIL
   * ============================================================
   */

  if (!email) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-white"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #565AF4 0px,
              #565AF4 92px,
              #4F52F4 92px,
              #4F52F4 184px
            )
          `,
        }}
      >
        {/* Background bubbles */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.08] blur-[110px]" />

        <div className="pointer-events-none absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-indigo-300/[0.18] blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-300/[0.12] blur-[110px]" />

        {/* Card */}

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
          {/* Card bubble */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.08] blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white text-[#4F52F4] shadow-xl">
              <Mail size={27} strokeWidth={2.2} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              Verification email missing
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/60">
              We couldn&apos;t find the email address required for
              verification. Please register again to receive a new
              verification code.
            </p>

            <button
              type="button"
              onClick={() => router.replace("/register")}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-[#4F52F4] shadow-lg transition hover:bg-white/90"
            >
              <ArrowLeft size={17} />
              Back to registration
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * VERIFY OTP
   * ============================================================
   */

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            #565AF4 0px,
            #565AF4 92px,
            #4F52F4 92px,
            #4F52F4 184px
          )
        `,
      }}
    >
      {/* ====================================================== */}
      {/* BACKGROUND BUBBLES */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top left */}

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.08] blur-[110px]" />

        {/* Top right */}

        <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-300/[0.18] blur-[120px]" />

        {/* Center */}

        <div className="absolute left-[35%] top-[30%] h-[350px] w-[350px] rounded-full bg-white/[0.05] blur-[100px]" />

        {/* Bottom left */}

        <div className="absolute -bottom-44 -left-20 h-[550px] w-[550px] rounded-full bg-purple-300/[0.12] blur-[120px]" />

        {/* Bottom right */}

        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-white/[0.08] blur-[110px]" />
      </div>

      {/* ====================================================== */}
      {/* NAVBAR */}
      {/* ====================================================== */}

      <header className="relative z-20 border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4F52F4] shadow-lg transition group-hover:scale-105">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            <span className="text-xl font-bold tracking-tight">
              SlotGo
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
          >
            Back to registration
          </button>
        </div>
      </header>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <div className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* MAIN GLASS CARD */}

          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
            {/* Card bubbles */}

            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.08] blur-[70px]" />

            <div className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-indigo-300/[0.08] blur-[80px]" />

            <div className="relative z-10">

              <h1 className="mt-7 text-3xl font-bold tracking-tight">
                Verify your email
              </h1>

              <p className="mt-1 text-sm leading-6 text-white/80">
                We&apos;ve sent a 6-digit verification code to the
                email address below.
              </p>

              {/* EMAIL */}

              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/[0.08] px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Mail size={17} className="text-white/70" />
                </div>

                <p className="min-w-0 break-all text-sm font-medium text-white">
                  {email}
                </p>
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="otp"
                      className="text-md font-bold text-white/90"
                    >
                      Verification code
                    </label>

                    <span className="text-xs text-white/70">
                      6 digits
                    </span>
                  </div>

                  <input
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      setOtp(value);
                      setError("");
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    disabled={isSubmitting}
                    autoFocus
                    className="w-full rounded-2xl border border-white/15 bg-black/[0.12] px-4 py-5 text-center text-3xl font-bold tracking-[0.45em] text-white outline-none transition placeholder:text-white/20 focus:border-white/40 focus:bg-black/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                    <div className="mt-0.5 shrink-0">
                      <ShieldCheck size={17} />
                    </div>

                    <p className="leading-5">{error}</p>
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-semibold text-[#4F52F4] shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={19} />
                      Verify email
                    </>
                  )}
                </button>
              </form>

              {/* INFO */}

              <div className="mt-2 rounded-2xl border border-white/10 bg-black/[0.08] p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-white/50"
                  />

                  <p className="text-xs leading-4 text-white/75">
                    Your verification code is temporary and can only
                    be used within the configured expiration period.
                  </p>
                </div>
              </div>

              {/* BACK */}

              <button
                type="button"
                onClick={() => router.replace("/register")}
                disabled={isSubmitting}
                className="mx-auto mt-6 flex items-center gap-2 text-sm text-white transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                Use a different email
              </button>
            </div>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-center text-xs text-white/35">
            SlotGo · Smart parking made simple
          </p>
        </div>
      </div>
    </main>
  );
}