"use client";

import { ArrowRight, CalendarCheck, MapPin, CreditCard } from "lucide-react";

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
      className="relative overflow-hidden bg-[#06294a] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 72px)",
        }}
      />

      {/* Secondary fine vertical stripes */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 35px, rgba(0,0,0,0.12) 36px, transparent 37px, transparent 72px)",
        }}
      />

      {/* Soft center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/[0.06] blur-3xl" />

      {/* Top glow */}
      <div className="pointer-events-none absolute left-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-emerald-300/[0.05] blur-3xl" />

      {/* Bottom glow */}
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-80 w-80 rounded-full bg-teal-200/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          {/* Label */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.08] px-3.5 py-1.5 text-xs font-medium text-teal-100">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-lg shadow-teal-300/40" />
            How it works
          </div>

          {/* Heading */}

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Park in
            <span className="block text-teal-200">three simple steps.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-teal-50/55 sm:text-base">
            From finding a spot to completing your parking session, SlotGo keeps
            the entire process straightforward.
          </p>
        </div>

      
        <div className="relative mt-14">

          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[4.5rem] hidden h-px bg-[#06294a] lg:block" />

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
             
                  <article
                    className="
                      group
                      relative
                      h-full
                      overflow-hidden
                      rounded-[1.75rem]
                      border
                      border-teal-100/10
                      bg-[#06294a]/70
                      p-6
                      shadow-2xl
                      shadow-black/10
                      backdrop-blur-xl
                      transition
                      duration-300
                      hover:-translate-y-1
                      hover:border-teal-200/25
                      hover:bg-[#086159]/80
                      sm:p-8
                    "
                  >
                    {/* Card vertical accent */}

                    <div className="absolute inset-y-0 left-0 w-px bg-teal-200/20 transition group-hover:bg-teal-200/50" />

                    {/* Card top glow */}

                    <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-48 -translate-x-1/2 rounded-full bg-teal-300/[0.05] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

                   

                    <div className="relative flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold tracking-[0.2em] text-teal-200/80">
                        STEP {step.number}
                      </span>

                      <span className="text-5xl font-bold leading-none text-white/[0.045]">
                        {step.number}
                      </span>
                    </div>

        
                    <div
                      className="
                        relative
                        mt-8
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-teal-200/15
                        bg-teal-300/[0.08]
                        shadow-lg
                        shadow-black/10
                        transition
                        duration-300
                        group-hover:border-teal-200/30
                        group-hover:bg-teal-300/[0.13]
                      "
                    >
                      <Icon className="h-6 w-6 text-teal-200" />
                    </div>

                    {/* =================================================
                        CONTENT
                        ================================================= */}

                    <h3 className="relative mt-7 text-xl font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="relative mt-3 text-sm leading-6 text-teal-50/50">
                      {step.description}
                    </p>

                    {index < steps.length - 1 && (
                      <div className="mt-7 flex items-center justify-center lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-teal-200/10 bg-teal-300/[0.05]">
                          <ArrowRight className="h-4 w-4 rotate-90 text-teal-200/60" />
                        </div>
                      </div>
                    )}
                  </article>


                  {index < steps.length - 1 && (
                    <div className="absolute right-[-14px] top-[4.1rem] z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-teal-200/15 bg-[#06294a] shadow-lg lg:flex">
                      <ArrowRight className="h-3.5 w-3.5 text-teal-200/70" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
