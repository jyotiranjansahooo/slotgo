"use client";

import { ArrowRight, Car, MapPin, Navigation, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#4d4ff2] text-white sm:min-h-[820px] lg:min-h-[880px]">
      {/* Background stripes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4c50f4] via-[#5658f5] to-[#3e42dc]" />

        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-y-0 left-[5%] w-16 bg-white/30 sm:w-24" />
          <div className="absolute inset-y-0 left-[20%] w-20 bg-white/20 sm:w-32" />
          <div className="absolute inset-y-0 left-[38%] w-16 bg-white/20 sm:w-24" />
          <div className="absolute inset-y-0 left-[55%] w-20 bg-white/20 sm:w-32" />
          <div className="absolute inset-y-0 left-[73%] w-16 bg-white/20 sm:w-24" />
          <div className="absolute inset-y-0 right-[5%] w-20 bg-white/20 sm:w-32" />
        </div>

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-10 lg:pt-44">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {/* Left */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Smart parking made simple
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[82px]">
              Find Your
              <br />
              <span className="text-white">Parking Space.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
              Discover nearby parking spaces, check availability, reserve
              your spot, and park without the usual hassle.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
              >
                Find Parking
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => router.push("/register")}
                className="rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Create Account
              </button>
            </div>

            {/* Small stats */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <Stat value="24/7" label="Availability" />
              <Stat value="Easy" label="Booking" />
              <Stat value="Secure" label="Payments" />
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto w-full max-w-2xl">
            {/* Floating map card */}
            <div className="relative rounded-[32px] bg-white p-3 shadow-2xl sm:p-4">
              <div className="relative min-h-[430px] overflow-hidden rounded-[25px] bg-slate-100 sm:min-h-[510px]">
                {/* Fake map */}
                <div className="absolute inset-0 bg-[#e8edf5]">
                  <div className="absolute left-[12%] top-[-10%] h-[140%] w-16 rotate-[25deg] bg-white/90 sm:w-24" />
                  <div className="absolute left-[48%] top-[-20%] h-[150%] w-12 -rotate-[18deg] bg-white/80 sm:w-20" />
                  <div className="absolute right-[12%] top-[-10%] h-[140%] w-20 rotate-[35deg] bg-white/80 sm:w-28" />

                  <div className="absolute left-0 right-0 top-[35%] h-12 -rotate-6 bg-white/90 sm:h-16" />
                  <div className="absolute left-0 right-0 top-[67%] h-14 rotate-3 bg-white/80 sm:h-20" />

                  <div className="absolute left-[30%] top-[20%] h-2 w-48 rotate-[50deg] bg-slate-300/60 sm:w-72" />
                  <div className="absolute bottom-[20%] right-[15%] h-2 w-52 -rotate-[35deg] bg-slate-300/60 sm:w-72" />
                </div>

                {/* Map top controls */}
                <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-5 sm:top-5">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-slate-700 shadow-lg">
                    <Search size={17} />
                    <span className="text-xs font-medium sm:text-sm">
                      Search nearby
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Current location"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-lg"
                  >
                    <Navigation size={17} />
                  </button>
                </div>

                {/* Parking pins */}
                <ParkingPin className="left-[20%] top-[32%]" price="₹40" />
                <ParkingPin className="right-[20%] top-[26%]" price="₹60" />
                <ParkingPin className="left-[42%] top-[53%]" price="₹50" active />
                <ParkingPin className="right-[25%] top-[65%]" price="₹35" />

                {/* Current location */}
                <div className="absolute bottom-[24%] left-[28%]">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-xl ring-8 ring-indigo-600/15">
                    <Car size={22} />
                  </div>
                </div>

                {/* Bottom parking card */}
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <MapPin size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold">
                            Central Parking Hub
                          </p>

                          <p className="text-xs text-slate-400">
                            350m away
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">
                        ₹40
                      </p>
                      <p className="text-[11px] text-slate-400">per hour</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/driver/parkings")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
                  >
                    View Parking
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating availability card */}
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl bg-white p-4 text-slate-900 shadow-2xl sm:block lg:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Available now</p>
                  <p className="text-lg font-black">18 spots</p>
                </div>
              </div>
            </div>

            {/* Floating booking card */}
            <div className="absolute -right-3 top-24 hidden rounded-2xl bg-white p-4 text-slate-900 shadow-2xl sm:block lg:-right-8">
              <p className="text-xs text-slate-400">Average booking</p>
              <p className="mt-1 text-lg font-black">2 min</p>
              <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[78%] rounded-full bg-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[50%] bg-white" />
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-lg font-bold text-white sm:text-xl">{value}</p>
      <p className="mt-1 text-xs text-white/55">{label}</p>
    </div>
  );
}

function ParkingPin({
  price,
  className,
  active = false,
}: {
  price: string;
  className: string;
  active?: boolean;
}) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={[
          "relative flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold shadow-lg",
          active
            ? "bg-indigo-600 text-white ring-4 ring-indigo-600/20"
            : "bg-white text-slate-800",
        ].join(" ")}
      >
        <MapPin size={13} />
        {price}
      </div>

      <div
        className={[
          "absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45",
          active ? "bg-indigo-600" : "bg-white",
        ].join(" ")}
      />
    </div>
  );
}