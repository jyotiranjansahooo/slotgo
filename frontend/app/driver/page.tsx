"use client";

import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <DriverDashboard />
    </ProtectedRoute>
  );
}

function DriverDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm text-zinc-500">Driver dashboard</p>

          <h1 className="mt-1 text-3xl font-bold">Welcome to SlotGo</h1>

          <p className="mt-2 text-zinc-400">
            Manage your vehicles, find parking, and track your bookings.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="My Vehicles"
            description="Add, edit, and manage your registered vehicles."
            buttonText="Manage vehicles"
            onClick={() => router.push("/driver/vehicles")}
          />

          <DashboardCard
            title="Find Parking"
            description="Search approved parking locations available near you."
            buttonText="Find parking"
            onClick={() => router.push("/driver/parkings")}
          />

          <DashboardCard
            title="My Bookings"
            description="View your current and previous parking bookings."
            buttonText="View bookings"
            onClick={() => router.push("/driver/bookings")}
          />
        </div>
      </div>
    </main>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

function DashboardCard({
  title,
  description,
  buttonText,
  onClick,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        {buttonText}
      </button>
    </div>
  );
}
