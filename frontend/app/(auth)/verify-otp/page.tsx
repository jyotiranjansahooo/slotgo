import { Suspense } from "react";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";

function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#4F52F4] text-white">
      <div
        className="absolute inset-0"
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
      />

      {/* ===================================================== */}
      {/* BUBBLES / GLOW */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-300/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-10 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* LOGO */}

          <div className="mb-7 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white text-[#4F52F4] shadow-2xl">
              <svg
                width="26"
                height="26"
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
          </div>

          {/* GLASS CARD */}

          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
            {/* Bubble */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl" />

            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl">
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <h1 className="mt-6 text-3xl font-bold tracking-tight">
                Verify your email
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/60">
                We&apos;ve sent a 6-digit verification code to your email
                address. Enter the code below to activate your SlotGo account.
              </p>

              {/* LOADING */}

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 px-5 py-4">
                <div className="mx-auto flex items-center justify-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                </div>

                <p className="mt-3 text-sm text-white/60">
                  Loading verification...
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-center text-xs text-white/40">
            SlotGo · Smart parking made simple
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
