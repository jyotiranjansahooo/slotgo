"use client";

import {
  CarFront,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Parking Spots",
    description: "Available across SlotGo",
    icon: MapPin,
  },
  {
    value: "1,000+",
    label: "Drivers",
    description: "Already using SlotGo",
    icon: Users,
  },
  {
    value: "100+",
    label: "Parking Owners",
    description: "Growing with SlotGo",
    icon: CarFront,
  },
  {
    value: "99%",
    label: "Secure Booking",
    description: "Reliable parking experience",
    icon: ShieldCheck,
  },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-[#080b18] px-4 py-16 text-white sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={[
                  "group relative p-6 transition hover:bg-white/[0.035] sm:p-7",
                  index !== 0
                    ? "border-t border-white/10 sm:border-l lg:border-t-0"
                    : "",
                  index === 2
                    ? "lg:border-l"
                    : "",
                ].join(" ")}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.04] opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>

                    <span className="text-xs font-medium text-slate-600">
                      SlotGo
                    </span>
                  </div>

                  <p className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>

                  <h3 className="mt-2 text-sm font-semibold text-slate-200">
                    {stat.label}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}