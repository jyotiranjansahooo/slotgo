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
  ArrowLeft,
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

      queryClient.invalidateQueries({
        queryKey: ["my-vehicles"],
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

      queryClient.invalidateQueries({
        queryKey: ["my-vehicles"],
      });
    },

    onError: (error: unknown) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  if (vehiclesQuery.isLoading) {
    return <VehiclesLoading />;
  }

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

  const defaultVehicle = activeVehicles.find((vehicle) => vehicle.isDefault);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#26174f] text-white">
      {/* ======================================================
          BACKGROUND
         ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Vertical stripes */}

        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 42px, rgba(255,255,255,0.16) 43px, rgba(255,255,255,0.16) 44px)",
          }}
        />

        {/* Secondary wider stripes */}

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 120px, rgba(236,72,153,0.28) 121px, rgba(236,72,153,0.28) 123px)",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/20 blur-[110px]" />

        <div className="absolute -right-40 top-16 h-[32rem] w-[32rem] rounded-full bg-violet-300/20 blur-[120px]" />

        <div className="absolute left-[35%] top-[35%] h-[28rem] w-[28rem] rounded-full bg-purple-300/10 blur-[120px]" />

        <div className="absolute -bottom-40 right-1/4 h-[30rem] w-[30rem] rounded-full bg-pink-400/10 blur-[120px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-4 lg:pb-16 lg:pt-26">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl">
                <Car className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-white/60">
                  Driver account
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  My Vehicles
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Manage your registered vehicles and choose which vehicle you want
              to use when making a parking booking.
            </p>
          </div>

          {/* ADD VEHICLE */}

          <button
            type="button"
            onClick={() => router.push("/driver/vehicles/add")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#5b21b6] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>

        {/* ERROR */}

        {actionError && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 backdrop-blur-xl">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />

            <div>
              <p className="text-sm font-semibold text-red-100">
                Vehicle operation failed
              </p>

              <p className="mt-1 text-sm text-red-200/70">{actionError}</p>
            </div>
          </div>
        )}

        {/* ======================================================
            STATS
           ====================================================== */}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total vehicles"
            value={vehicles.length}
            icon={<Car className="h-5 w-5" />}
          />

          <StatCard
            label="Active vehicles"
            value={activeVehicles.length}
            icon={<Check className="h-5 w-5" />}
          />

          <StatCard
            label="Default vehicle"
            value={defaultVehicle ? "Set" : "None"}
            icon={<Star className="h-5 w-5" />}
          />
        </section>

        {/* ======================================================
            VEHICLES
           ====================================================== */}

        {vehicles.length === 0 ? (
          <EmptyVehicles onAdd={() => router.push("/driver/vehicles/add")} />
        ) : (
          <>
            <div className="mt-12 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-white/50">Your garage</p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Your vehicles
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  {activeVehicles.length} active{" "}
                  {activeVehicles.length === 1 ? "vehicle" : "vehicles"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

                    if (!confirmed) return;

                    setActionError("");
                    deleteMutation.mutate(vehicle._id);
                  }}
                  onSetDefault={() => {
                    setActionError("");
                    defaultMutation.mutate(vehicle._id);
                  }}
                  onView={() => router.push(`/driver/vehicles/${vehicle._id}`)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/*
 * =============================================================
 * VEHICLE CARD
 * =============================================================
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
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14]">
      {/* TOP */}

      <div className="border-b border-white/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b21b6] shadow-lg">
              <Car className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {vehicle.brand} {vehicle.vehicleModel}
              </h3>

              <p className="mt-1 truncate font-mono text-xs text-white/45">
                {vehicle.registrationNumber}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
              vehicle.isActive
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-white/10 text-white/45"
            }`}
          >
            {vehicle.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* BADGES */}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs capitalize text-white/60">
            {formatVehicleType(vehicle.vehicleType)}
          </span>

          {vehicle.color && (
            <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/60">
              {vehicle.color}
            </span>
          )}

          {vehicle.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#5b21b6]">
              <Star className="h-3 w-3 fill-current" />
              Default
            </span>
          )}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="p-5">
        <button
          type="button"
          onClick={onView}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          View vehicle
          <ChevronRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/15 bg-red-500/5 px-3 py-3 text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
 * =============================================================
 * STAT CARD
 * =============================================================
 */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:bg-white/[0.13]">
      <div className="flex items-center gap-3 text-white/55">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>

        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-5 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

/*
 * =============================================================
 * EMPTY STATE
 * =============================================================
 */

function EmptyVehicles({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 px-5 py-16 text-center shadow-2xl backdrop-blur-xl sm:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#5b21b6] shadow-xl">
        <Car className="h-8 w-8" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">No vehicles registered</h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
        Add your first vehicle to start making parking bookings through SlotGo.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#5b21b6] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
      >
        <Plus className="h-4 w-4" />
        Add your first vehicle
      </button>
    </section>
  );
}

function VehiclesLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#26174f] px-4 pb-8 pt-28 text-white sm:px-6 sm:pb-10 sm:pt-32 lg:px-10 lg:pt-36">
      {" "}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 42px, rgba(255,255,255,0.16) 43px, rgba(255,255,255,0.16) 44px)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl animate-pulse">
        <div className="h-10 w-52 rounded-xl bg-white/10" />

        <div className="mt-4 h-5 w-full max-w-xl rounded bg-white/10" />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-[1.5rem] bg-white/10" />
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-72 rounded-[1.75rem] bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * ERROR
 * =============================================================
 */

function VehiclesError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#26174f] px-4 pb-8 pt-28 text-white sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 42px, rgba(255,255,255,0.16) 43px, rgba(255,255,255,0.16) 44px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-200" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">Unable to load vehicles</h1>

        <p className="mt-2 text-sm leading-6 text-red-100/70">{message}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#5b21b6] transition hover:bg-white/90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * VEHICLE TYPE
 * =============================================================
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
