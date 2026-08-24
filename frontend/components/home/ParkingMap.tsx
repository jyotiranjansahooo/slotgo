"use client";

import {
  LocateFixed,
  MapPin,
  Navigation,
  ParkingSquare,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ParkingMap() {
  const router = useRouter();

  return (
    <section
      id="parking-map"
      className="relative isolate overflow-hidden bg-[#072C4B] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(20,184,166,0.10) 0px, rgba(20,184,166,0.10) 1px, transparent 1px, transparent 72px)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 72px, rgba(15,118,110,0.08) 72px, rgba(15,118,110,0.08) 144px)",
        }}
      />

      {/* Top glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl" />

      {/* Left glow */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Right glow */}
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />



      <div className="relative mx-auto max-w-7xl">
 
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            {/* BADGE */}

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-400/10 px-3 py-1.5 text-xs font-medium text-teal-200 backdrop-blur-sm">
              <Navigation className="h-3.5 w-3.5" />
              Explore nearby
            </div>

            {/* TITLE */}

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find parking
              <span className="block bg-gradient-to-r from-teal-200 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                around you.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/60 sm:text-base">
              Explore parking locations and choose the spot that works best for
              your journey.
            </p>
          </div>

          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={() => router.push("/driver/parkings")}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/80 shadow-lg backdrop-blur-md transition hover:border-teal-300/20 hover:bg-white/15 hover:text-white"
          >
            <Search className="h-4 w-4" />
            Search all parking
          </button>
        </div>


        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#072C4B] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="relative h-[420px] overflow-hidden sm:h-[500px]">

            <div className="absolute inset-0 opacity-30">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(45,212,191,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.10) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
            </div>

            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(20,184,166,0.08) 0px, rgba(20,184,166,0.08) 2px, transparent 2px, transparent 96px)",
              }}
            />

            <div className="absolute left-[-10%] top-[35%] h-16 w-[120%] rotate-[-8deg] border-y border-white/10 bg-white/[0.025]" />

            <div className="absolute left-[20%] top-[-20%] h-[140%] w-14 rotate-[24deg] border-x border-white/10 bg-white/[0.025]" />

            <div className="absolute right-[15%] top-[-20%] h-[140%] w-20 rotate-[-35deg] border-x border-white/10 bg-white/[0.025]" />

            <div className="absolute bottom-[15%] left-[-10%] h-12 w-[120%] rotate-[17deg] border-y border-white/10 bg-white/[0.025]" />

            <span className="absolute left-[12%] top-[22%] text-xs font-medium text-teal-100/40 sm:text-sm">
              Central Area
            </span>

            <span className="absolute right-[16%] top-[26%] text-xs font-medium text-teal-100/40 sm:text-sm">
              City Centre
            </span>

            <span className="absolute bottom-[23%] left-[26%] text-xs font-medium text-teal-100/40 sm:text-sm">
              Market Road
            </span>

            <span className="absolute bottom-[18%] right-[20%] text-xs font-medium text-teal-100/40 sm:text-sm">
              Downtown
            </span>


            <ParkingMarker className="left-[20%] top-[35%]" label="₹40" />

            <ParkingMarker
              className="left-[46%] top-[25%]"
              label="₹60"
              active
            />

            <ParkingMarker className="right-[24%] top-[38%]" label="₹50" />

            <ParkingMarker className="left-[34%] bottom-[20%]" label="₹35" />

            <ParkingMarker className="right-[35%] bottom-[25%]" label="₹45" />

          

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute -inset-5 animate-pulse rounded-full bg-teal-400/10" />

              <div className="absolute -inset-3 rounded-full border border-teal-300/20 bg-teal-400/10" />

              <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-teal-400 shadow-lg shadow-teal-400/50" />
            </div>

            <div className="absolute bottom-5 right-5 flex flex-col gap-2">
              <button
                type="button"
                aria-label="Use current location"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#072C4B] text-teal-100/70 shadow-xl backdrop-blur-md transition hover:border-teal-300/20 hover:bg-[#072C4B] hover:text-white"
              >
                <LocateFixed className="h-5 w-5" />
              </button>
            </div>

      
            <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-[#063A38]/90 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                <span className="text-sm font-medium">Parking locations</span>
              </div>

              <p className="mt-1 text-xs text-teal-100/40">
                Explore available locations
              </p>
            </div>
          </div>

          {/* ======================================================
              MAP FOOTER
             ====================================================== */}

          <div className="border-t border-white/10 bg-white/[0.035] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/10 bg-teal-400/10">
                  <MapPin className="h-5 w-5 text-teal-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Looking for a parking spot?
                  </p>

                  <p className="mt-0.5 text-xs text-teal-100/40">
                    Browse all available parking locations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:from-teal-400 hover:to-emerald-500"
              >
                <ParkingSquare className="h-4 w-4" />
                Explore parking
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
            NOTICE
           ====================================================== */}

        <p className="mt-4 text-center text-xs text-teal-100/25">
          Interactive map navigation will be connected once parking coordinates
          are available from the backend.
        </p>
      </div>
    </section>
  );
}

/*
 * =============================================================
 * PARKING MARKER
 * =============================================================
 */

function ParkingMarker({
  label,
  active = false,
  className,
}: {
  label: string;
  active?: boolean;
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={[
          "relative flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition",
          active
            ? "border-teal-200/40 bg-teal-500 text-white shadow-teal-500/30"
            : "border-white/10 bg-[#063A38]/90 text-teal-50/80",
        ].join(" ")}
      >
        <ParkingSquare className="h-3.5 w-3.5" />
        {label}
      </div>

      <div
        className={[
          "absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r",
          active
            ? "border-teal-200/40 bg-teal-500"
            : "border-white/10 bg-[#063A38]",
        ].join(" ")}
      />
    </div>
  );
}
