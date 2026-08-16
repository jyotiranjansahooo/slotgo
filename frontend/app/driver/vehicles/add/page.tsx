"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicle/VehicleForm";

import { createVehicle } from "@/services/vehicle.service";

import { getApiErrorMessage } from "@/lib/api-error";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import type { CreateVehicleData } from "@/types/vehicle";

export default function AddVehiclePage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <AddVehicle />
    </ProtectedRoute>
  );
}

function AddVehicle() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (data: CreateVehicleData) => {
    try {
      setIsSubmitting(true);
      setError("");

      await createVehicle(data);

      router.push("/driver/vehicles");
      router.refresh();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/driver/vehicles")}
          className="mb-6 text-sm text-zinc-400 hover:text-white"
        >
          ← Back to vehicles
        </button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
          <h1 className="text-3xl font-bold">Add vehicle</h1>

          <p className="mt-2 mb-8 text-zinc-400">
            Add your vehicle to use it for parking bookings.
          </p>

          {error && (
            <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <VehicleForm
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/driver/vehicles")}
          />
        </div>
      </div>
    </main>
  );
}
