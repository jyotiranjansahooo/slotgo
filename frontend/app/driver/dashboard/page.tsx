"use client";

import { useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DriverSidebar from "@/components/ui/driver/DriverSidebar";
import DriverHeader from "@/components/ui/driver/DriverHeader";
import DriverMobileNav from "@/components/ui/driver/DriverMobileNav";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import { useAuth } from "@/providers/AuthProvider";

export default function DriverPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <DriverDashboard />
    </ProtectedRoute>
  );
}

function DriverDashboard() {
  const { user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const firstName = user?.firstName || "Driver";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DriverSidebar />

      <div className="lg:pl-64">
        <DriverHeader
          onMenuClick={() =>
            setMobileMenuOpen(true)
          }
        />

        {/* Mobile overlay menu */}

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute inset-0 bg-black/70"
            />

            <div className="relative h-full w-72 border-r border-white/10 bg-slate-950 p-5">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    SlotGo
                  </p>

                  <p className="text-xs text-slate-500">
                    Driver Portal
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                <MobileMenuLink
                  href="/driver"
                  label="Dashboard"
                  icon="⌂"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                />

                <MobileMenuLink
                  href="/driver/parkings"
                  label="Find Parking"
                  icon="⌕"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                />

                <MobileMenuLink
                  href="/driver/vehicles"
                  label="My Vehicles"
                  icon="▣"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                />

                <MobileMenuLink
                  href="/driver/bookings"
                  label="My Bookings"
                  icon="◷"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                />

                <MobileMenuLink
                  href="/driver/profile"
                  label="Settings"
                  icon="⚙"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                />
              </div>
            </div>
          </div>
        )}

        <main className="px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl">
            {/* Hero */}

            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-blue-500/5 to-transparent p-6 sm:p-8">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />

              <div className="relative">
                <Badge variant="blue">
                  Driver Dashboard
                </Badge>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Good to see you, {firstName} 👋
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Find a parking space, manage your
                  vehicles, and keep track of all your
                  bookings from one place.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/driver/parkings"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                  >
                    Find Parking
                    <span className="ml-2">→</span>
                  </Link>

                  <Link
                    href="/driver/bookings"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                  >
                    View Bookings
                  </Link>
                </div>
              </div>
            </section>

            {/* Stats */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Active Booking"
                value="—"
                description="No active booking"
                icon="◷"
              />

              <StatCard
                label="Vehicles"
                value="—"
                description="Manage your vehicles"
                icon="▣"
              />

              <StatCard
                label="Completed"
                value="—"
                description="Parking sessions"
                icon="✓"
              />

              <StatCard
                label="Total Spent"
                value="₹—"
                description="Your parking expenses"
                icon="₹"
              />
            </section>

            {/* Main grid */}

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              {/* Current booking */}

              <Card className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Current Booking
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Your active parking
                    </h2>
                  </div>

                  <Link
                    href="/driver/bookings"
                    className="text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    View all →
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl">
                    ◷
                  </div>

                  <h3 className="mt-4 font-medium text-white">
                    No active booking
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Once you book a parking slot,
                    your active booking will appear
                    here.
                  </p>

                  <Link
                    href="/driver/parkings"
                    className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200"
                  >
                    Find Parking
                  </Link>
                </div>
              </Card>

              {/* Quick actions */}

              <Card className="p-5 sm:p-6">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Quick Actions
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  What do you want to do?
                </h2>

                <div className="mt-5 grid gap-3">
                  <ActionCard
                    href="/driver/parkings"
                    icon="⌕"
                    title="Find Parking"
                    description="Discover nearby parking spaces"
                  />

                  <ActionCard
                    href="/driver/vehicles"
                    icon="▣"
                    title="Manage Vehicles"
                    description="Add or update your vehicles"
                  />

                  <ActionCard
                    href="/driver/bookings"
                    icon="◷"
                    title="My Bookings"
                    description="View your booking history"
                  />
                </div>
              </Card>
            </section>

            {/* Nearby parking placeholder */}

            <section className="mt-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Explore
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Nearby Parking
                  </h2>
                </div>

                <Link
                  href="/driver/parkings"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Explore all →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ParkingPlaceholder />
                <ParkingPlaceholder />
                <ParkingPlaceholder />
              </div>
            </section>
          </div>
        </main>

        <DriverMobileNav />
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   ACTION CARD
============================================================ */

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-lg transition group-hover:bg-blue-500/10">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400">
        →
      </span>
    </Link>
  );
}

/* ============================================================
   PARKING PLACEHOLDER
============================================================ */

function ParkingPlaceholder() {
  return (
    <Card className="overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex h-full items-center justify-center text-3xl text-slate-700">
          P
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">
              Parking near you
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Parking availability will appear here
            </p>
          </div>

          <Badge variant="gray">
            Available
          </Badge>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-sm text-slate-500">
            Starting from
          </span>

          <span className="font-semibold text-white">
            ₹—
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   MOBILE MENU LINK
============================================================ */

function MobileMenuLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
        {icon}
      </span>

      {label}
    </Link>
  );
}