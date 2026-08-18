"use client";

import { useState } from "react";
import {
  Car,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  deleteVehicle,
  getMyVehicles,
  setDefaultVehicle,
} from "@/services/vehicle.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { Vehicle } from "@/types/vehicle";

export default function VehiclesPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <Vehicles />
    </ProtectedRoute>
  );
}

function Vehicles() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: getMyVehicles,
    retry: 1,
  });

const [actionError, setActionError] = useState("");
  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,

    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: unknown) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultVehicle,

    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: unknown) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (vehiclesQuery.isLoading) {
    return <VehiclesLoading />;
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (vehiclesQuery.isError) {
    return (
      <VehiclesError
        message={getApiErrorMessage(vehiclesQuery.error)}
        onRetry={() => vehiclesQuery.refetch()}
      />
    );
  }

  const vehicles: Vehicle[] = vehiclesQuery.data?.data ?? [];

  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ======================================================
            HEADER
           ====================================================== */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <Car className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-400">
                  Driver account
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Vehicles
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage your registered vehicles and choose which vehicle you want
              to use when making a parking booking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/driver/vehicles/add")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </header>

        {/* ======================================================
            ACTION ERROR
           ====================================================== */}

        {actionError && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <p className="text-sm font-medium text-red-300">
                Vehicle operation failed
              </p>

              <p className="mt-1 text-sm text-red-400/80">
                {actionError}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            STATS
           ====================================================== */}

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            label="Total vehicles"
            value={vehicles.length}
            icon={<Car className="h-4 w-4" />}
          />

          <StatCard
            label="Active vehicles"
            value={activeVehicles.length}
            icon={<Check className="h-4 w-4" />}
          />

          <StatCard
            label="Default vehicle"
            value={
              activeVehicles.some((vehicle) => vehicle.isDefault) ? "Set" : "None"
            }
            icon={<Star className="h-4 w-4" />}
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {/* ======================================================
            EMPTY STATE
           ====================================================== */}

        {vehicles.length === 0 ? (
          <EmptyVehicles
            onAdd={() => router.push("/driver/vehicles/add")}
          />
        ) : (
          <>
            {/* ==================================================
                VEHICLE LIST HEADER
               ================================================== */}

            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your vehicles</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {activeVehicles.length} active{" "}
                  {activeVehicles.length === 1 ? "vehicle" : "vehicles"}
                </p>
              </div>
            </div>

            {/* ==================================================
                VEHICLE GRID
               ================================================== */}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  isDeleting={deleteMutation.isPending}
                  isSettingDefault={defaultMutation.isPending}
                  onEdit={() =>
                    router.push(`/driver/vehicles/${vehicle._id}/edit`)
                  }
                  onDelete={() => {
                    const confirmed = window.confirm(
                      `Delete ${vehicle.brand} ${vehicle.vehicleModel}?`,
                    );

                    if (!confirmed) {
                      return;
                    }

                    setActionError("");
                    deleteMutation.mutate(vehicle._id);
                  }}
                  onSetDefault={() => {
                    setActionError("");
                    defaultMutation.mutate(vehicle._id);
                  }}
                  onView={() =>
                    router.push(`/driver/vehicles/${vehicle._id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * VEHICLE CARD
 * ============================================================
 */

interface VehicleCardProps {
  vehicle: Vehicle;
  isDeleting: boolean;
  isSettingDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onView: () => void;
}

function VehicleCard({
  vehicle,
  isDeleting,
  isSettingDefault,
  onEdit,
  onDelete,
  onSetDefault,
  onView,
}: VehicleCardProps) {
  const isBusy = isDeleting || isSettingDefault;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.045]">
      {/* TOP */}

      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Car className="h-5 w-5 text-slate-300" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">
                {vehicle.brand} {vehicle.vehicleModel}
              </h3>

              <p className="mt-1 truncate font-mono text-xs text-slate-500">
                {vehicle.registrationNumber}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              vehicle.isActive
                ? "bg-green-500/10 text-green-300"
                : "bg-slate-500/10 text-slate-400"
            }`}
          >
            {vehicle.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* BADGES */}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs capitalize text-slate-400">
            {formatVehicleType(vehicle.vehicleType)}
          </span>

          {vehicle.color && (
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-400">
              {vehicle.color}
            </span>
          )}

          {vehicle.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-300">
              <Star className="h-3 w-3 fill-current" />
              Default
            </span>
          )}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="p-4">
        <button
          type="button"
          onClick={onView}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]"
        >
          View vehicle

          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            Delete
          </button>
        </div>

        {!vehicle.isDefault && vehicle.isActive && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={isBusy}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSettingDefault ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}

            Set as default
          </button>
        )}
      </div>
    </article>
  );
}

/*
 * ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs sm:text-sm">{label}</span>
      </div>

      <p className="mt-3 text-xl font-bold text-white sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * EMPTY STATE
 * ============================================================
 */

function EmptyVehicles({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
        <Car className="h-7 w-7 text-blue-400" />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        No vehicles registered
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Add your first vehicle to start making parking bookings through
        SlotGo.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Add your first vehicle
      </button>
    </section>
  );
}

/*
 * ============================================================
 * LOADING
 * ============================================================
 */

function VehiclesLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-white/10" />

          <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/5" />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * ERROR
 * ============================================================
 */

function VehiclesError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          Unable to load vehicles
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-300/80">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * VEHICLE TYPE
 * ============================================================
 */

function formatVehicleType(type: Vehicle["vehicleType"]): string {
  switch (type) {
    case "twoWheeler":
      return "Two Wheeler";

    case "fourWheeler":
      return "Four Wheeler";

    case "vanMinibus":
      return "Van / Minibus";

    case "heavyVehicle":
      return "Heavy Vehicle";

    default:
      return type;
  }
}
