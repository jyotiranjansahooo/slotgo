"use client";

import {
  CalendarCheck,
  CreditCard,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: MapPinned,
    title: "Find Nearby Parking",
    description:
      "Discover available parking locations around you and choose the one that fits your destination.",
  },
  {
    icon: CalendarCheck,
    title: "Book in Seconds",
    description:
      "Select your vehicle, parking location, date and time, then confirm your parking slot quickly.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Complete your parking payment through a secure checkout experience with clear pricing.",
  },
  {
    icon: ShieldCheck,
    title: "Manage Every Booking",
    description:
      "Keep track of your active, upcoming and completed parking bookings from one place.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#080b18] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[-10%] top-1/4 h-96 w-96 rounded-full bg-violet-600/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
            Why SlotGo
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Parking made
            <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              simple.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
            Everything you need to find, book and manage parking without the
            usual hassle.
          </p>
        </div>

        {/* FEATURES */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.045]"
              >
                {/* Number */}
                <span className="absolute right-5 top-5 text-xs font-semibold text-slate-700">
                  0{index + 1}
                </span>

                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 transition group-hover:border-indigo-400/25 group-hover:bg-indigo-500/15">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>

                {/* Content */}
                <h3 className="relative mt-6 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div className="mt-6 h-px w-10 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}