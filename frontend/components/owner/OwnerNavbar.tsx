"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  ParkingSquare,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/providers/AuthProvider";

const navigation = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    label: "My Parkings",
    href: "/owner/parkings",
    icon: ParkingSquare,
  },
  {
    label: "Bookings",
    href: "/owner/bookings",
    icon: CalendarDays,
  },
];

export default function OwnerNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#064b46]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/owner"
            className="group flex items-center"
            onClick={() => setMobileOpen(false)}
            aria-label="SlotGo Owner Dashboard"
          >
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent/10 shadow-lg shadow-black/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <Image
                src="/images/logo.png"
                alt="SlotGo"
                width={150}
                height={150}
                priority
                className="h-full w-full object-contain p-1"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/owner"
                  ? pathname === "/owner"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "border border-emerald-200/15 bg-emerald-300/10 text-emerald-50"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4 transition",
                      isActive
                        ? "text-emerald-200"
                        : "text-white/40 group-hover:text-white/70",
                    ].join(" ")}
                  />

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.firstName ?? "Owner"}
                </p>

                <p className="max-w-[150px] truncate text-xs text-white/35">
                  {user?.email}
                </p>
              </div>

              <Link
                href="/profile"
                aria-label="Open profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/15 bg-emerald-300/10 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/50"
              >
                {user?.firstName?.charAt(0).toUpperCase() ?? "O"}
              </Link>
            </div>

            <button
              type="button"
              onClick={logout}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-white/60 transition hover:border-red-200/10 hover:bg-red-400/10 hover:text-red-100 md:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white md:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#064b46]/95 px-4 py-4 backdrop-blur-2xl md:hidden">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href === "/owner"
                    ? pathname === "/owner"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-emerald-300/10 text-emerald-50"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />

                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300/10 text-sm font-semibold text-emerald-100">
                  {user?.firstName?.charAt(0).toUpperCase() ?? "O"}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName ?? "Owner"}
                  </p>

                  <p className="truncate text-xs text-white/35">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-red-400/10 hover:text-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
