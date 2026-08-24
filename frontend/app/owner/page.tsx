"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OwnerNavbar from "@/components/owner/OwnerNavbar";

import { useAuth } from "@/providers/AuthProvider";
import { CalendarDays, CarFront, ChevronRight, Wallet } from "lucide-react";
import Link from "next/link";

export default function OwnerPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerDashboard />
    </ProtectedRoute>
  );
}

function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.025) 75%, transparent 75%)",
            backgroundSize: "90px 90px",
          }}
        />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />
      </div>

      <OwnerNavbar />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div>
          <p className="text-sm font-medium text-emerald-200/60">
            Parking Owner
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {user?.firstName}.
          </h1>

          <p className="mt-3 text-sm text-white/45">
            Manage your parking locations, bookings and earnings.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <DashboardCard
            href="/owner/parkings"
            icon={CarFront}
            title="My Parkings"
            description="Manage your parking locations and availability."
          />

          <DashboardCard
            href="/owner/bookings"
            icon={CalendarDays}
            title="Bookings"
            description="View and manage bookings from drivers."
          />

          <DashboardCard
            href="/owner/wallet"
            icon={Wallet}
            title="Wallet"
            description="View your earnings and transactions."
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof CarFront;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/10 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-200/20 hover:bg-white/[0.07]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/[0.06] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/10 bg-emerald-300/10">
            <Icon className="h-5 w-5 text-emerald-100" />
          </div>

          <ChevronRight className="h-5 w-5 text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-200" />
        </div>

        <h2 className="mt-6 text-lg font-semibold">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-white/40">{description}</p>
      </div>
    </Link>
  );
}
