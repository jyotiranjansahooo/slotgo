"use client";

import {
  ArrowUpRight,
  CarFront,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
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
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#060814] px-4 pt-16 text-white sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* MAIN FOOTER */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* BRAND */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                <CarFront className="h-5 w-5 text-indigo-400" />
              </span>

              <span className="text-xl font-bold tracking-tight">
                Slot<span className="text-indigo-400">Go</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              A simpler way to find, book and manage parking. Discover nearby
              parking and get where you need to go without the hassle.
            </p>

            <Link
              href="/driver/parkings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold transition hover:from-indigo-500 hover:to-violet-500"
            >
              Find parking
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Navigation
            </h3>

            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Account
            </h3>

            <ul className="mt-5 space-y-3">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Get in touch
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                <span className="text-sm text-slate-500">
                  support@slotgo.com
                </span>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                <span className="text-sm text-slate-500">
                  +91 00000 00000
                </span>
              </div>

              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                <span className="text-sm leading-5 text-slate-500">
                  Available across
                  <br />
                  selected locations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-12 h-px bg-white/10" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} SlotGo. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-slate-600 transition hover:text-slate-300"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-600 transition hover:text-slate-300"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}