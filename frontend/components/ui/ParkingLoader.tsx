"use client";

import { CarFront, ParkingSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface ParkingLoaderProps {
  onComplete?: () => void;
}

export default function ParkingLoader({ onComplete }: ParkingLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2400;
    const intervalTime = 24;
    const totalSteps = duration / intervalTime;

    let step = 0;

    const interval = window.setInterval(() => {
      step += 1;

      const nextProgress = Math.min(Math.round((step / totalSteps) * 100), 100);

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(interval);

        if (onComplete) {
          window.setTimeout(onComplete, 180);
        }
      }
    }, intervalTime);

    return () => {
      window.clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <main className="fixed inset-0 z-[9999] overflow-hidden bg-[#5154F4]">

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5154F4] via-[#5b5df5] to-[#393bd1]" />

        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/10 blur-[120px]" />

        <div className="absolute -bottom-60 -right-40 h-[700px] w-[700px] rounded-full bg-indigo-950/20 blur-[140px]" />

        {/* Decorative circles */}
        <div className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-white/30" />

        <div className="absolute left-[18%] top-[70%] h-3 w-3 rounded-full bg-white/20" />

        <div className="absolute right-[15%] top-[24%] h-2 w-2 rounded-full bg-white/30" />

        <div className="absolute right-[25%] top-[65%] h-3 w-3 rounded-full bg-white/20" />

        {/* Very subtle vertical lines */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute left-[12%] inset-y-0 w-px bg-white" />
          <div className="absolute left-[30%] inset-y-0 w-px bg-white" />
          <div className="absolute left-[50%] inset-y-0 w-px bg-white" />
          <div className="absolute left-[70%] inset-y-0 w-px bg-white" />
          <div className="absolute left-[88%] inset-y-0 w-px bg-white" />
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* =======================================================
            SLOTGO LOGO
        ======================================================= */}

        <div className="loader-logo flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_15px_50px_rgba(20,20,100,0.25)]">
            <ParkingSquare
              size={30}
              strokeWidth={2.5}
              className="text-[#5154F4]"
            />
          </div>

          <span className="text-2xl font-bold tracking-tight text-white">
            SlotGo
          </span>
        </div>

        {/* =======================================================
            BIG NUMBER
        ======================================================= */}

        <div className="relative mt-10">
          {/* Glow behind number */}
          <div className="absolute inset-0 scale-150 rounded-full bg-white/10 blur-3xl" />

          <div
            className="relative font-black leading-none tracking-[-0.08em] text-white"
            style={{
              fontSize: "clamp(100px, 20vw, 230px)",
            }}
          >
            {String(progress).padStart(2, "0")}
            <span className="ml-2 text-[0.35em] tracking-normal text-white/70">
              %
            </span>
          </div>
        </div>

        {/* Small label */}
        <div className="mt-2 text-sm font-medium uppercase tracking-[0.35em] text-white/55">
          Loading
        </div>
      </div>

      {/* =========================================================
          PARKING ROAD
      ========================================================= */}

      <div className="absolute bottom-0 left-0 right-0 h-[180px] overflow-hidden">
        {/* Road background */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#151742]/25" />

        {/* Road top line */}
        <div className="absolute bottom-28 left-0 right-0 h-px bg-white/20" />

        {/* Road markings */}
        <div className="absolute bottom-10 left-0 right-0 flex gap-16">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="h-[3px] w-16 shrink-0 rounded-full bg-white/25"
            />
          ))}
        </div>

        {/* =======================================================
            PARKING BAY
        ======================================================= */}

        <div className="absolute bottom-7 right-[12%] h-20 w-32 rounded-t-2xl border-2 border-dashed border-white/25">
          {/* Parking floor */}
          <div className="absolute inset-x-4 bottom-0 h-12 border-l-2 border-r-2 border-white/15" />

          {/* P sign */}
          <div className="absolute -top-12 right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="text-lg font-black text-white">P</span>
          </div>

          {/* Glow */}
          <div className="absolute inset-5 rounded-xl bg-white/5 blur-xl" />
        </div>

        {/* =======================================================
            MOVING CAR
        ======================================================= */}

        <div className="parking-car absolute bottom-[42px] left-0">
          <div className="relative">
            {/* Car glow */}
            <div className="absolute -inset-5 rounded-full bg-[#5154F4]/50 blur-xl" />

            <div className="relative">
              <CarFront
                size={70}
                strokeWidth={1.7}
                className="fill-[#5154F4] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              />

              {/* Headlight */}
              <div className="absolute right-[7px] top-[18px] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_white]" />
            </div>
          </div>
        </div>

        {/* =======================================================
            MOTION LINES
        ======================================================= */}

        <div className="parking-motion absolute bottom-[73px] left-0">
          <div className="space-y-2">
            <div className="h-[2px] w-16 rounded-full bg-white/30" />
            <div className="ml-5 h-[2px] w-9 rounded-full bg-white/20" />
            <div className="ml-2 h-[2px] w-12 rounded-full bg-white/25" />
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATION
      ========================================================= */}

      <style jsx>{`
        .loader-logo {
          animation: logoEnter 700ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .parking-car {
          animation: driveToParking 2.4s cubic-bezier(0.65, 0, 0.25, 1)
            forwards;
        }

        .parking-motion {
          animation: motionLines 2.4s cubic-bezier(0.65, 0, 0.25, 1)
            forwards;
        }

        @keyframes logoEnter {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes driveToParking {
          0% {
            transform: translateX(-120px);
          }

          10% {
            transform: translateX(4vw);
          }

          30% {
            transform: translateX(22vw);
          }

          55% {
            transform: translateX(45vw);
          }

          72% {
            transform: translateX(62vw);
          }

          84% {
            transform: translateX(72vw);
          }

          92% {
            transform: translateX(75vw);
          }

          100% {
            transform: translateX(calc(88vw - 70px));
          }
        }

        @keyframes motionLines {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }

          15% {
            opacity: 0.8;
          }

          55% {
            opacity: 0.5;
            transform: translateX(35vw);
          }

          80% {
            opacity: 0;
            transform: translateX(65vw);
          }

          100% {
            opacity: 0;
            transform: translateX(80vw);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-logo,
          .parking-car,
          .parking-motion {
            animation: none;
          }

          .parking-car {
            transform: translateX(calc(88vw - 70px));
          }

          .parking-motion {
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
