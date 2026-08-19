"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { verifyEmailOtp } = useAuth();

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setServerError("");
    setSuccess("");

    if (!email) {
      setServerError("Email is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setServerError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await verifyEmailOtp({
        email,
        otp,
      });

      setSuccess("Email verified successfully.");

      if (user.role === "driver") {
        router.replace("/driver");
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

      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold">Invalid verification link</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Your registration email is missing.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="mt-6 w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            Back to registration
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Verify your email</h1>

          <p className="mt-2 text-sm text-zinc-400">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 break-all text-sm font-medium text-white">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-medium">
              Verification code
            </label>

            <input
              id="otp"
              name="otp"
              value={otp}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 6);

                setOtp(value);
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              disabled={isSubmitting}
              autoFocus
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-900 bg-green-950/50 p-3 text-sm text-green-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.replace("/register")}
          disabled={isSubmitting}
          className="mt-6 w-full text-center text-sm text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back to registration
        </button>
      </div>
    </main>
  );
}

function VerifyOtpFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <p className="text-sm text-zinc-400">Loading verification...</p>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
