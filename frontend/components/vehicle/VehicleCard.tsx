"use client";

import {
  useRouter,
} from "next/navigation";

import type {
  Vehicle,
} from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: (
    vehicleId: string,
  ) => Promise<void>;
  onSetDefault: (
    vehicleId: string,
  ) => Promise<void>;
  isProcessing: boolean;
}

const vehicleTypeLabels: Record<
  Vehicle["vehicleType"],
  string
> = {
  twoWheeler: "Two Wheeler",
  fourWheeler: "Four Wheeler",
  vanMinibus: "Van / Minibus",
  heavyVehicle: "Heavy Vehicle",
};

export default function VehicleCard({
  vehicle,
  onDelete,
  onSetDefault,
  isProcessing,
}: VehicleCardProps) {
  const router = useRouter();

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {vehicle.brand}{" "}
              {vehicle.vehicleModel}
            </h2>

            {vehicle.isDefault && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-black">
                Default
              </span>
            )}
          </div>

          <p className="mt-2 font-mono text-sm text-zinc-400">
            {vehicle.registrationNumber}
          </p>
        </div>

        <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
          {
            vehicleTypeLabels[
              vehicle.vehicleType
            ]
          }
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5">
        <div>
          <p className="text-xs text-zinc-500">
            Color
          </p>

          <p className="mt-1 text-sm">
            {vehicle.color}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">
            Status
          </p>

          <p className="mt-1 text-sm">
            {vehicle.isActive
              ? "Active"
              : "Inactive"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/driver/vehicles/${vehicle._id}/edit`,
            )
          }
          disabled={isProcessing}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800 disabled:opacity-50"
        >
          Edit
        </button>

        {!vehicle.isDefault && (
          <button
            type="button"
            onClick={() =>
              onSetDefault(
                vehicle._id,
              )
            }
            disabled={isProcessing}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800 disabled:opacity-50"
          >
            Set default
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onDelete(vehicle._id)
          }
          disabled={isProcessing}
          className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}