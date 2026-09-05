"use client";

import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ParkingSquare,
  User,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { authStorage } from "@/lib/auth-storage";

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/parkings",
    label: "Parkings",
    icon: ParkingSquare,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: CalendarDays,
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const firstName = user?.firstName?.trim() || "Admin";
  const lastName = user?.lastName?.trim() || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const initials = getInitials(firstName, lastName);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    authStorage.clear();

    setProfileOpen(false);
    setMobileOpen(false);

    router.replace("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#06544E]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
       <Link
  href="/admin"
  onClick={() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }}
  className="group flex shrink-0 items-center"
  aria-label="SlotGo Admin Dashboard"
>
  <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full bg-transparent/10 shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-105">
    <Image
      src="/images/logo.png"
      alt="SlotGo"
      width={56}
      height={56}
      priority
      className="h-[48px] w-[48px] object-contain"
    />
  </div>
</Link>

        <div className="hidden items-center gap-1 lg:flex">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/45 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition ${
                    active
                      ? "text-emerald-200"
                      : "text-white/30 group-hover:text-white/70"
                  }`}
                />

                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1.5 transition hover:bg-white/10 sm:px-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#06544E]">
                {initials}
              </div>

              <div className="hidden max-w-32 text-left md:block">
                <p className="truncate text-xs font-semibold text-white/85">
                  {fullName}
                </p>

                <p className="truncate text-[10px] text-white/30">
                  Administrator
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 text-white/30 transition md:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#075951] shadow-2xl shadow-black/30">
                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#06544E]">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {fullName}
                      </p>

                      <p className="truncate text-xs text-white/35">
                        {user?.email || "Administrator account"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      pathname.startsWith("/admin/profile")
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-200/70 transition hover:bg-red-400/10 hover:text-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileOpen((current) => !current);
              setProfileOpen(false);
            }}
            aria-label={
              mobileOpen ? "Close admin navigation" : "Open admin navigation"
            }
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
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
        <div className="border-t border-white/10 bg-[#075951]/95 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-emerald-200" : "text-white/30"
                      }`}
                    />

                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/admin/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  pathname.startsWith("/admin/profile")
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <User className="h-5 w-5 text-white/30" />
                Profile
              </Link>
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#06544E]">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {fullName}
                </p>

                <p className="truncate text-xs text-white/30">
                  {user?.email || "Administrator account"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200/70 transition hover:bg-red-400/10 hover:text-red-100"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  const initials = `${first}${last}`.toUpperCase();

  return initials || "A";
}
