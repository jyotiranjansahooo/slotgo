"use client";

import Link from "next/link";

import { ArrowLeft, Home, MapPin, TriangleAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b18] px-4 text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5154F4]/10 blur-[150px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* ANIMATION */}
        <div className="relative h-72 w-full overflow-hidden sm:h-80">
          {/* ROAD */}
          <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-white/10" />

          {/* Road markings */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 opacity-20">
            <span className="h-[2px] w-16 bg-white" />
            <span className="h-[2px] w-16 bg-white" />
            <span className="h-[2px] w-16 bg-white" />
            <span className="h-[2px] w-16 bg-white" />
            <span className="h-[2px] w-16 bg-white" />
          </div>

          {/* DESTINATION / BARRIER */}
          <div className="absolute bottom-16 right-[18%]">
            {/* Warning sign */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2">
              <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-md border-2 border-[#5154F4] bg-[#5154F4]/10">
                <TriangleAlert className="h-5 w-5 -rotate-45 text-[#5154F4]" />
              </div>

              <div className="mx-auto h-12 w-1 bg-white/20" />
            </div>

            {/* Barrier */}
            <div className="relative h-5 w-32 overflow-hidden rounded-md border border-white/10 bg-white/10">
              <div className="absolute inset-0 -skew-x-12 bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_12px,#5154F4_12px,#5154F4_22px)]" />
            </div>

            {/* Barrier legs */}
            <div className="absolute -bottom-6 left-3 h-6 w-2 bg-white/15" />
            <div className="absolute -bottom-6 right-3 h-6 w-2 bg-white/15" />
          </div>

          {/* CAR */}
          <div className="absolute bottom-[52px] left-0 animate-[carCrash_4s_cubic-bezier(.65,0,.35,1)_forwards]">
            <div className="relative h-16 w-32">
              {/* CAR BODY */}
              <div className="absolute bottom-0 left-0 h-9 w-32 rounded-[10px_16px_8px_8px] bg-[#5154F4] shadow-[0_10px_35px_rgba(81,84,244,0.3)]">
                {/* Front */}
                <div className="absolute right-[-3px] top-3 h-5 w-3 rounded-r-md bg-[#5154F4]" />

                {/* Headlight */}
                <div className="absolute right-1 top-2 h-3 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />

                {/* Tail light */}
                <div className="absolute left-1 top-2 h-3 w-2 rounded-full bg-red-400" />

                {/* Door */}
                <div className="absolute left-[72px] top-3 h-6 w-px bg-white/20" />

                {/* Door handle */}
                <div className="absolute left-[79px] top-5 h-1 w-3 rounded-full bg-white/40" />
              </div>

              {/* ROOF */}
              <div className="absolute left-7 top-0 h-9 w-[72px] rounded-t-[18px] bg-[#5154F4]">
                {/* Windows */}
                <div className="absolute left-2 top-2 h-6 w-[68px] overflow-hidden rounded-t-[11px] bg-[#080b18]/80">
                  <div className="absolute left-1 top-1 h-1 w-8 rotate-12 rounded-full bg-white/15" />

                  <div className="absolute left-[48%] top-0 h-full w-px bg-white/10" />
                </div>
              </div>

              {/* WHEELS */}
              <div className="absolute bottom-[-7px] left-5 h-8 w-8 rounded-full border-[5px] border-[#080b18] bg-[#5154F4]">
                <div className="absolute inset-1 rounded-full bg-white/20" />
              </div>

              <div className="absolute bottom-[-7px] right-5 h-8 w-8 rounded-full border-[5px] border-[#080b18] bg-[#5154F4]">
                <div className="absolute inset-1 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* MOTION LINES */}
          <div className="absolute bottom-[90px] left-0 animate-[motionLines_4s_ease-out_forwards]">
            <div className="space-y-2">
              <div className="h-[2px] w-14 rounded-full bg-[#5154F4]/50" />
              <div className="ml-5 h-[2px] w-8 rounded-full bg-[#5154F4]/30" />
              <div className="h-[2px] w-10 rounded-full bg-[#5154F4]/40" />
            </div>
          </div>

          {/* CRASH EFFECT */}
          <div className="pointer-events-none absolute bottom-[80px] right-[20%]">
            {/* Impact flash */}
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-[impactFlash_4s_ease-out_forwards] rounded-full bg-white" />

            {/* Sparks */}
            <span className="absolute h-2 w-8 origin-left animate-[spark1_4s_ease-out_forwards] rounded-full bg-[#5154F4]" />
            <span className="absolute h-2 w-6 origin-left animate-[spark2_4s_ease-out_forwards] rounded-full bg-white" />
            <span className="absolute h-1.5 w-7 origin-left animate-[spark3_4s_ease-out_forwards] rounded-full bg-[#5154F4]" />
            <span className="absolute h-1.5 w-5 origin-left animate-[spark4_4s_ease-out_forwards] rounded-full bg-white" />
          </div>

          {/* DUST */}
          <div className="absolute bottom-[60px] right-[18%] h-16 w-24 animate-[dust_4s_ease-out_forwards] rounded-full bg-white/10 blur-xl" />
        </div>

        {/* 404 */}
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <MapPin className="h-5 w-5 text-[#5154F4]" />

            <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#5154F4]">
              Destination not found
            </span>
          </div>

          <h1 className="mt-4 text-8xl font-black tracking-tighter text-white sm:text-9xl">
            404
          </h1>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Looks like we crashed.
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40 sm:text-base">
            The parking spot you`re looking for doesn`t exist or has moved to
            another location.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#5154F4] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(81,84,244,0.25)] transition hover:-translate-y-0.5 hover:bg-[#6063ff]"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes carCrash {
          0% {
            transform: translateX(-150px);
          }

          15% {
            transform: translateX(20px);
          }

          45% {
            transform: translateX(280px);
          }

          70% {
            transform: translateX(520px);
          }

          77% {
            transform: translateX(570px);
          }

          80% {
            transform: translateX(580px) rotate(0deg);
          }

          83% {
            transform: translateX(580px) rotate(-7deg);
          }

          87% {
            transform: translateX(580px) rotate(8deg);
          }

          91% {
            transform: translateX(580px) rotate(-5deg);
          }

          100% {
            transform: translateX(580px) rotate(0deg);
          }
        }

        @keyframes motionLines {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }

          15% {
            opacity: 1;
          }

          50% {
            opacity: 0.7;
            transform: translateX(250px);
          }

          75% {
            opacity: 0;
            transform: translateX(500px);
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes impactFlash {
          0%,
          74% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }

          78% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
          }

          84% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(4);
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes spark1 {
          0%,
          75% {
            opacity: 0;
            transform: rotate(20deg) translateX(0);
          }

          80% {
            opacity: 1;
            transform: rotate(20deg) translateX(20px);
          }

          90%,
          100% {
            opacity: 0;
            transform: rotate(20deg) translateX(60px);
          }
        }

        @keyframes spark2 {
          0%,
          75% {
            opacity: 0;
            transform: rotate(-35deg) translateX(0);
          }

          80% {
            opacity: 1;
            transform: rotate(-35deg) translateX(15px);
          }

          90%,
          100% {
            opacity: 0;
            transform: rotate(-35deg) translateX(55px);
          }
        }

        @keyframes spark3 {
          0%,
          75% {
            opacity: 0;
            transform: rotate(50deg) translateX(0);
          }

          80% {
            opacity: 1;
            transform: rotate(50deg) translateX(15px);
          }

          90%,
          100% {
            opacity: 0;
            transform: rotate(50deg) translateX(50px);
          }
        }

        @keyframes spark4 {
          0%,
          75% {
            opacity: 0;
            transform: rotate(-60deg) translateX(0);
          }

          80% {
            opacity: 1;
            transform: rotate(-60deg) translateX(12px);
          }

          90%,
          100% {
            opacity: 0;
            transform: rotate(-60deg) translateX(45px);
          }
        }

        @keyframes dust {
          0%,
          70% {
            opacity: 0;
            transform: scale(0.3);
          }

          78% {
            opacity: 0.8;
            transform: scale(1);
          }

          100% {
            opacity: 0;
            transform: scale(2.2);
          }
        }
      `}</style>
    </main>
  );
}
