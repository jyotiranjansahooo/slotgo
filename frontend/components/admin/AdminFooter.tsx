"use client";

import {
  CalendarDays,
  CarFront,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

const adminLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: ShieldCheck,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/parkings",
    label: "Parkings",
    icon: CarFront,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: CalendarDays,
  },
];

export default function AdminFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-black/10 text-white">
      {/* Background glow */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-emerald-300/5 blur-[100px]" />

        <div className="absolute right-1/4 top-0 h-48 w-48 rounded-full bg-emerald-200/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ============================================================
            TOP
        ============================================================ */}

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* BRAND */}

          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-[#06544E] shadow-lg">
                S
              </div>

              <div>
                <p className="font-bold tracking-tight">SlotGo</p>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
                  Administration
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/35">
              SlotGo administration portal for managing users, parking
              locations, bookings and platform activity.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/30">
              <ShieldCheck className="h-4 w-4 text-emerald-200/50" />

              <span>Secure administration portal</span>
            </div>
          </div>

          {/* ADMIN NAVIGATION */}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Administration
            </h3>

            <div className="mt-4 space-y-2">
              {adminLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-0.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-white/25 transition group-hover:text-emerald-200" />

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT / SUPPORT */}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Admin
            </h3>

            <div className="mt-4 space-y-2">
              <Link
                href="/admin/profile"
                className="group flex items-center gap-3 rounded-xl px-3 py-0.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <ShieldCheck className="h-4 w-4 text-white/25 transition group-hover:text-emerald-200" />

                Admin Profile
              </Link>

              <div className="flex items-center gap-3 px-3 py-0.5 text-sm text-white/30">
                <MapPin className="h-4 w-4 text-white/20" />

                SlotGo Platform
              </div>

              <div className="flex items-center gap-3 px-3 py-0.5 text-sm text-white/30">
                <Mail className="h-4 w-4 text-white/20" />

                Administration
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            DIVIDER
        ============================================================ */}

        <div className="my-8 h-px bg-white/10" />

        <div className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/25">
            © {new Date().getFullYear()} SlotGo. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-white/25">
            <span>Admin Portal</span>

            <span className="h-1 w-1 rounded-full bg-white/20" />

            <span>Parking Management System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}