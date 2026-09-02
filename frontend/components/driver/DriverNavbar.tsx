"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";

export default function DriverNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Driver";

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "D";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigation = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);

    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  const navigation = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Find Parking",
      href: "/driver/parkings",
      icon: MapPin,
    },
    {
      label: "My Bookings",
      href: "/driver/bookings",
      icon: CalendarDays,
    },
    {
      label: "Vehicles",
      href: "/driver/vehicles",
      icon: CarFront,
    },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full bg-transparent text-white">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={handleNavigation}
          className="group flex shrink-0 items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#4338ff] shadow-lg transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-105">
            <MapPin className="h-5 w-5" strokeWidth={2.7} />
          </span>

          <span className="text-xl font-black tracking-tight text-white">
            SlotGo
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-[#4338ff] shadow-lg shadow-black/10"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-[#4338ff]" : "text-white/90"
                  }`}
                  strokeWidth={2}
                />

                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div ref={profileRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className={`flex items-center gap-2.5 rounded-2xl border px-2 py-1.5 transition-all duration-200 ${
              profileOpen
                ? "border-white/30 bg-white/15 shadow-lg"
                : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/10"
            }`}
            aria-expanded={profileOpen}
            aria-label="Open user menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-black text-[#4338ff] shadow-md">
              {initials}
            </span>

            <span className="hidden max-w-[130px] truncate text-sm font-bold text-white lg:block">
              {user?.firstName || "Driver"}
            </span>

            <ChevronDown
              className={`h-4 w-4 text-white/80 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[330px] overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl shadow-black/25">
              <div className="bg-[#4338ff] p-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setMobileOpen(false);
                      router.push("/driver");
                    }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#4338ff] shadow-lg transition duration-200 hover:scale-105 hover:bg-white/95 active:scale-95"
                    aria-label="Go to driver dashboard"
                  >
                    {initials}
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">
                      {fullName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-white/65">
                      Driver account
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3">
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
                    <Mail className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      Email
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-zinc-700">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
                    <Phone className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      Phone
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-zinc-700">
                      {user?.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 p-3">
                <Link
                  href="/driver/vehicles"
                  onClick={handleNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <CarFront className="h-4 w-4 text-[#4338ff]" />
                  My Vehicles
                </Link>

                <Link
                  href="/driver/bookings"
                  onClick={handleNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <CalendarDays className="h-4 w-4 text-[#4338ff]" />
                  My Bookings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-95 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/10 px-4 pb-5 pt-3 backdrop-blur-md md:hidden">
          <div className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleNavigation}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-[#4338ff]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />

                  {label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setMobileOpen(false);
                    router.push("/driver");
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#4338ff] shadow-lg transition duration-200 hover:scale-105 hover:bg-white/95 active:scale-95"
                  aria-label="Go to driver dashboard"
                >
                  {initials}
                </button>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {fullName}
                  </p>

                  <p className="truncate text-xs text-white/55">
                    {user?.email || "Driver account"}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Link
                  href="/driver/vehicles"
                  onClick={handleNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  <CarFront className="h-4 w-4" />
                  My Vehicles
                </Link>

                <Link
                  href="/driver/bookings"
                  onClick={handleNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  <CalendarDays className="h-4 w-4" />
                  My Bookings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-red-100 transition hover:bg-red-500/15"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
