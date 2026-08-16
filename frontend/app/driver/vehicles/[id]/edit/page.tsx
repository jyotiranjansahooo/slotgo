"use client";

import {
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import VehicleForm from "@/components/vehicle/VehicleForm";

import {
  getVehicle,
  updateVehicle,
} from "@/services/vehicle.service";

import {
  getApiErrorMessage,
} from "@/lib/api-error";

import type {
  UpdateVehicleData,
} from "@/types/vehicle";

export default function EditVehiclePage() {
  return (
    <ProtectedRoute
      allowedRoles={["driver"]}
    >
      <EditVehicle />
    </ProtectedRoute>
  );
}

function EditVehicle() {
  const router = useRouter();
  const params = useParams();

  const queryClient =
    useQueryClient();

  const vehicleId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [error, setError] =
    useState("");

  const vehicleQuery =
    useQuery({
      queryKey: [
        "vehicle",
        vehicleId,
      ],

      queryFn: () =>
        getVehicle(vehicleId),

      enabled:
        vehicleId.length > 0,
    });

  const updateMutation =
    useMutation({
      mutationFn: (
        data: UpdateVehicleData,
      ) =>
        updateVehicle(
          vehicleId,
          data,
        ),

      onSuccess: async (
        response,
      ) => {
        queryClient.setQueryData(
          [
            "vehicle",
            vehicleId,
          ],
          response,
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "vehicles",
            ],
          },
        );

        router.push(
          "/driver/vehicles",
        );
      },

      onError: (error: unknown) => {
        setError(
          getApiErrorMessage(error),
        );
      },
    });

  const handleSubmit = async (
    data: {
      vehicleType:
        | "twoWheeler"
        | "fourWheeler"
        | "vanMinibus"
        | "heavyVehicle";

      registrationNumber: string;

      brand: string;

      vehicleModel: string;

      color: string;
    },
  ) => {
    setError("");

    const updateData: UpdateVehicleData =
      {
        vehicleType:
          data.vehicleType,

        brand: data.brand,

        vehicleModel:
          data.vehicleModel,

        color: data.color,
      };

    updateMutation.mutate(
      updateData,
    );
  };

  if (!vehicleId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-red-400">
          Invalid vehicle ID.
        </p>
      </main>
    );
  }

  if (vehicleQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">
          Loading vehicle...
        </p>
      </main>
    );
  }

  if (
    vehicleQuery.isError ||
    !vehicleQuery.data?.data
  ) {
    const message =
      vehicleQuery.isError
        ? getApiErrorMessage(
            vehicleQuery.error,
          )
        : "Vehicle not found.";

    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <h1 className="text-xl font-semibold">
              Unable to load vehicle
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {message}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/driver/vehicles",
                )
              }
              className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black"
            >
              Back to vehicles
            </button>
          </div>
        </div>
      </main>
    );
  }

  const vehicle =
    vehicleQuery.data.data;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/driver/vehicles",
            )
          }
          className="mb-6 text-sm text-zinc-400 hover:text-white"
        >
          ← Back to vehicles
        </button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
          <h1 className="text-3xl font-bold">
            Edit vehicle
          </h1>

          <p className="mt-2 mb-8 text-zinc-400">
            Update your vehicle information.
          </p>

          {(error ||
            updateMutation.isError) && (
            <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error ||
                getApiErrorMessage(
                  updateMutation.error,
                )}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">
              Registration number
            </p>

            <p className="mt-1 font-mono text-lg">
              {
                vehicle.registrationNumber
              }
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Registration numbers cannot be
              changed.
            </p>
          </div>

          <VehicleForm
            vehicle={vehicle}
            isSubmitting={
              updateMutation.isPending
            }
            onSubmit={handleSubmit}
            onCancel={() =>
              router.push(
                "/driver/vehicles",
              )
            }
          />
        </div>
      </div>
    </main>
  );
}