"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import VehicleCard from "@/components/vehicle/VehicleCard";

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

  const [error, setError] = useState("");

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],

    queryFn: async () => {
      const response = await getMyVehicles();

      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: unknown) => {
      setError(getApiErrorMessage(error));
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (vehicleId: string) => setDefaultVehicle(vehicleId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: unknown) => {
      setError(getApiErrorMessage(error));
    },
  });

const handleDelete = async (
  vehicleId: string,
): Promise<void> => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this vehicle?",
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");

    await deleteMutation.mutateAsync(
      vehicleId,
    );
  } catch (error: unknown) {
    setError(
      getApiErrorMessage(error),
    );
  }
};

const handleSetDefault = async (
  vehicleId: string,
): Promise<void> => {
  try {
    setError("");

    await defaultMutation.mutateAsync(
      vehicleId,
    );
  } catch (error: unknown) {
    setError(
      getApiErrorMessage(error),
    );
  }
};

  const isProcessing = deleteMutation.isPending || defaultMutation.isPending;

  if (vehiclesQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading vehicles...</p>
      </main>
    );
  }

  if (vehiclesQuery.isError) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6">
            <h1 className="text-xl font-semibold">Unable to load vehicles</h1>

            <p className="mt-2 text-sm text-red-300">
              {getApiErrorMessage(vehiclesQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => void vehiclesQuery.refetch()}
              className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const vehicles: Vehicle[] = vehiclesQuery.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-zinc-500">Driver</p>

            <h1 className="mt-1 text-3xl font-bold">My vehicles</h1>

            <p className="mt-2 text-zinc-400">
              Manage the vehicles you use for parking bookings.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void vehiclesQuery.refetch()}
              disabled={vehiclesQuery.isFetching || isProcessing}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-medium transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {vehiclesQuery.isFetching ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/driver/vehicles/add")}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
            >
              + Add vehicle
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <h2 className="text-xl font-semibold">No vehicles yet</h2>

            <p className="mt-2 text-zinc-500">
              Add your first vehicle to start making parking bookings.
            </p>

            <button
              type="button"
              onClick={() => router.push("/driver/vehicles/add")}
              className="mt-6 rounded-lg bg-white px-5 py-3 font-medium text-black"
            >
              Add your first vehicle
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
