"use client";

import { useQuery } from "@tanstack/react-query";
import { CarFront, MapPin, ShieldCheck, Users } from "lucide-react";

import { getPlatformStats } from "@/services/stats.service";

interface StatItem {
  value: string;
  label: string;
  description: string;
  icon: typeof MapPin;
}

export default function Stats() {
  const statsQuery = useQuery({
    queryKey: ["platform-stats"],
    queryFn: getPlatformStats,
    staleTime: 5 * 60 * 1000,
  });

  if (statsQuery.isLoading) {
    return <StatsLoading />;
  }

  if (statsQuery.isError) {
    return (
      <section className="relative overflow-hidden bg-[#072C4B] px-4 py-16 text-white sm:px-6 lg:px-8">
        <Background />

        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-medium text-white/75">
              Unable to load platform statistics.
            </p>

            <button
              type="button"
              onClick={() => statsQuery.refetch()}
              className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const stats = statsQuery.data?.data;

  if (!stats) {
    return null;
  }

  const statItems: StatItem[] = [
    {
      value: formatNumber(stats.parkingSpots),
      label: "Parking Spots",
      description: "Available across SlotGo",
      icon: MapPin,
    },
    {
      value: formatNumber(stats.drivers),
      label: "Drivers",
      description: "Already using SlotGo",
      icon: Users,
    },
    {
      value: formatNumber(stats.parkingOwners),
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

  return (
    <section className="relative overflow-hidden bg-[#072C4B] px-4 py-16 text-white sm:px-6 lg:px-8">
      <Background />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={[
                  "group relative p-6 transition duration-300 hover:bg-white/[0.06] sm:p-7",
                  index !== 0
                    ? "border-t border-white/10 sm:border-l lg:border-t-0"
                    : "",
                ].join(" ")}
              >
                {/* Hover layer */}

                <div className="pointer-events-none absolute inset-0 bg-white/[0.025] opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative">
                  {/* TOP */}

                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-200/20 bg-teal-300/10">
                      <Icon className="h-5 w-5 text-teal-200" />
                    </div>

                    <span className="text-xs font-medium text-white/30">
                      SlotGo
                    </span>
                  </div>

                  <p className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>

                  <h3 className="mt-2 text-sm font-semibold text-white/90">
                    {stat.label}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/45">
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

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Diagonal stripe pattern */}

      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              135deg,
              transparent 0px,
              transparent 48px,
              rgba(255,255,255,0.045) 48px,
              rgba(255,255,255,0.045) 49px
            )
          `,
        }}
      />

      {/* Left glow */}

      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

      {/* Right glow */}

      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

      {/* Center glow */}

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.04] blur-3xl" />
    </div>
  );
}

function formatNumber(value: number): string {
  if (value >= 1000) {
    const formatted =
      value % 1000 === 0 ? `${value / 1000}K` : `${(value / 1000).toFixed(1)}K`;

    return `${formatted}+`;
  }

  return `${value}+`;
}

/*

 * LOADING

 */

function StatsLoading() {
  return (
    <section className="relative overflow-hidden bg-[#06544E] px-4 py-16 text-white sm:px-6 lg:px-8">
      <Background />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse border-white/10 p-7 sm:border-l lg:border-t-0"
            >
              <div className="h-11 w-11 rounded-xl bg-white/10" />

              <div className="mt-6 h-10 w-24 rounded-lg bg-white/10" />

              <div className="mt-3 h-4 w-28 rounded bg-white/10" />

              <div className="mt-2 h-3 w-40 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
