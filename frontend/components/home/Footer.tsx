"use client";

import { ArrowUpRight, CarFront, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Parking", href: "/driver/parkings" },
];

const accountLinks = [
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#072C4B] px-4 pt-16 text-white sm:px-6 lg:px-8">
   
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 72px)",
        }}
      />

      {/* Secondary fine stripe */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 35px, rgba(0,0,0,0.18) 35px, rgba(0,0,0,0.18) 36px)",
        }}
      />

      {/* Top atmospheric glow */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-teal-300/10 blur-3xl" />

      {/* Center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/[0.06] blur-3xl" />

      {/* Bottom glow */}
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-teal-200/10 blur-3xl" />

      {/* =====================================================
          CONTENT
         ===================================================== */}

      <div className="relative mx-auto max-w-7xl">
        {/* =================================================
            MAIN FOOTER
           ================================================= */}

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
          {/* =================================================
              BRAND
             ================================================= */}

          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-200/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur-xl transition duration-300 group-hover:border-teal-200/40 group-hover:bg-white/15">
                <CarFront className="h-5 w-5 text-teal-200 transition-transform duration-300 group-hover:scale-110" />
              </span>

              <span className="text-xl font-bold tracking-tight">
                Slot<span className="text-teal-200">Go</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-teal-100/55">
              A simpler way to find, book and manage parking. Discover nearby
              parking and get where you need to go without the hassle.
            </p>

            {/* CTA */}
            <Link
              href="/driver/parkings"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-[#06544E] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-50"
            >
              Find parking
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* =================================================
              NAVIGATION
             ================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">Navigation</h3>

            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-teal-100/50 transition duration-200 hover:text-white"
                  >
                    <span className="mr-2 h-px w-0 bg-teal-200 transition-all duration-200 group-hover:w-3" />

                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =================================================
              ACCOUNT
             ================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>

            <ul className="mt-5 space-y-3">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-teal-100/50 transition duration-200 hover:text-white"
                  >
                    <span className="mr-2 h-px w-0 bg-teal-200 transition-all duration-200 group-hover:w-3" />

                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =================================================
              CONTACT
             ================================================= */}

          <div>
            <h3 className="text-sm font-semibold text-white">Get in touch</h3>

            <div className="mt-5 space-y-4">
              {/* Email */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Mail className="h-4 w-4 text-teal-200" />
                </div>

                <span className="pt-1.5 text-sm text-teal-100/50">
                  support@slotgo.com
                </span>
              </div>

              {/* Phone */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Phone className="h-4 w-4 text-teal-200" />
                </div>

                <span className="pt-1.5 text-sm text-teal-100/50">
                  +91 00000 00000
                </span>
              </div>

              {/* Location */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <MapPin className="h-4 w-4 text-teal-200" />
                </div>

                <span className="pt-1 text-sm leading-5 text-teal-100/50">
                  Available across
                  <br />
                  selected locations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FEATURE STRIPE
           ================================================= */}

        <div className="relative my-12 h-px overflow-hidden bg-white/10">
          <div className="absolute left-0 top-0 h-px w-1/3 bg-teal-200/30" />
        </div>

        {/* =================================================
            BOTTOM
           ================================================= */}

        <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <p className="text-xs text-teal-100/35">
            © {new Date().getFullYear()} SlotGo. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-teal-100/35 transition hover:text-teal-100/80"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-teal-100/35 transition hover:text-teal-100/80"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
