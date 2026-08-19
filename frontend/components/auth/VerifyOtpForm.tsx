"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

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

      setError(
        getApiErrorMessage(error) ||
          "Invalid or expired verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <ShieldCheck size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Verification email missing
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Please register again to receive a verification code.
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
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <ShieldCheck size={22} />
          </div>

          <h1 className="text-3xl font-bold">
            Verify your email
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 break-all text-sm font-medium text-white">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium"
            >
              Verification code
            </label>

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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify email
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.replace("/register")}
          disabled={isSubmitting}
          className="mt-6 w-full text-center text-sm text-zinc-400 transition hover:text-white disabled:cursor-not-allowed"
        >
          Back to registration
        </button>
      </div>
    </main>
  );
}