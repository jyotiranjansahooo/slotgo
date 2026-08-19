"use client";

import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  CreditCard,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Find a parking spot",
    description:
      "Search for available parking locations near your destination and compare the options.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Choose your slot",
    description:
      "Select your vehicle, preferred parking slot, date and duration that suits your journey.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay & park",
    description:
      "Complete your payment, arrive at the parking location and enjoy a hassle-free parking experience.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#080b18] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            How it works
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Park in
            <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              three simple steps.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
            From finding a spot to completing your parking session, SlotGo
            keeps the entire process straightforward.
          </p>
        </div>

        {/* STEPS */}
        <div className="relative mt-14">
          {/* Desktop connector */}
          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-16 hidden h-px bg-gradient-to-r from-indigo-500/20 via-violet-500/40 to-indigo-500/20 lg:block" />

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  <article className="group relative h-full rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.045] sm:p-8">
                    {/* Number */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold tracking-[0.2em] text-indigo-400">
                        STEP {step.number}
                      </span>

                      <span className="text-4xl font-bold text-white/[0.04]">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="relative mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-lg shadow-indigo-950/20 transition group-hover:border-indigo-400/30 group-hover:bg-indigo-500/15">
                      <Icon className="h-6 w-6 text-indigo-400" />
                    </div>

                    {/* Content */}
                    <h3 className="mt-7 text-xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>

                    {/* Mobile arrow */}
                    {index < steps.length - 1 && (
                      <div className="mt-6 flex items-center justify-center lg:hidden">
                        <ArrowRight className="h-5 w-5 rotate-90 text-indigo-500/40" />
                      </div>
                    )}
                  </article>

                  {/* Desktop step indicator */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-[-13px] top-12 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-indigo-400/20 bg-[#0b1020] lg:flex">
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.025] px-5 py-3 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
            Ready when you are
          </div>
        </div>
      </div>
    </section>
  );
}