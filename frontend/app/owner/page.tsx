"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { useAuth } from "@/providers/AuthProvider";

export default function OwnerPage() {
  return (
    <ProtectedRoute
      allowedRoles={["parkingOwner"]}
    >
      <OwnerDashboard />
    </ProtectedRoute>
  );
}

function OwnerDashboard() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Parking Owner
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Welcome, {user?.firstName}
            </h1>

            <p className="mt-2 text-zinc-400">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm transition hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <DashboardCard
            title="My Parkings"
            description="Manage your parking locations."
          />

          <DashboardCard
            title="Bookings"
            description="View and manage parking bookings."
          />

          <DashboardCard
            title="Wallet"
            description="View earnings and transactions."
          />
        </div>
      </div>
    </main>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
}

function DashboardCard({
  title,
  description,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        {description}
      </p>
    </div>
  );
}