"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getParkings } from "@/services/parking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { Parking } from "@/types/parking";

export default function ParkingsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <ParkingList />
    </ProtectedRoute>
  );
}

function ParkingList() {
  const router = useRouter();

  const parkingQuery = useQuery({
    queryKey: ["parkings"],

    queryFn: async () => {
      const response = await getParkings();

      return response.data;
    },
  });

  if (parkingQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading parking locations...</p>
      </main>
    );
  }

  if (parkingQuery.isError) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6">
            <h1 className="text-xl font-semibold">
              Unable to load parking locations
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {getApiErrorMessage(parkingQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => void parkingQuery.refetch()}
              className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const parkings: Parking[] = parkingQuery.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <button
              type="button"
              onClick={() => router.push("/driver")}
              className="mb-5 text-sm text-zinc-500 hover:text-white"
            >
              ← Driver dashboard
            </button>

            <p className="text-sm text-zinc-500">Parking</p>

            <h1 className="mt-1 text-3xl font-bold">Find Parking</h1>

            <p className="mt-2 text-zinc-400">
              Choose an approved parking location for your vehicle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void parkingQuery.refetch()}
            disabled={parkingQuery.isFetching}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium hover:bg-zinc-900 disabled:opacity-50"
          >
            {parkingQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {parkings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <h2 className="text-xl font-semibold">No parking locations</h2>

            <p className="mt-2 text-zinc-500">
              There are currently no approved parking locations available.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {parkings.map((parking) => (
              <ParkingCard
                key={parking._id}
                parking={parking}
                onClick={() => router.push(`/driver/parkings/${parking._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface ParkingCardProps {
  parking: Parking;
  onClick: () => void;
}

function ParkingCard({ parking, onClick }: ParkingCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {parking.images.length > 0 ? (
      <Image
  src={parking.images[0].url}
  alt={parking.parkingName}
  width={800}
  height={400}
  className="h-48 w-full object-cover"
/>
      ) : (
        <div className="flex h-48 items-center justify-center bg-zinc-800 text-zinc-500">
          No image
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">{parking.parkingName}</h2>

          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs capitalize text-zinc-300">
            {parking.parkingType}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-400">{parking.address}</p>

        <p className="mt-1 text-sm text-zinc-500">
          {parking.city}, {parking.state} {parking.pincode}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-yellow-400">
            ★ {parking.averageRating.toFixed(1)}
          </span>

          <span className="text-zinc-500">{parking.totalReviews} reviews</span>
        </div>

        <div className="mt-5 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500">Starting price</p>

          <p className="mt-1 text-lg font-semibold">
            ₹{getStartingPrice(parking)}
            <span className="ml-1 text-sm font-normal text-zinc-500">
              / hour
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="mt-5 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          View parking
        </button>
      </div>
    </article>
  );
}

function getStartingPrice(parking: Parking): number {
  const prices = [
    parking.pricing.twoWheeler.hourly,
    parking.pricing.fourWheeler.hourly,
    parking.pricing.vanMinibus.hourly,
    parking.pricing.heavyVehicle.hourly,
  ].filter((price): price is number => typeof price === "number");

  if (prices.length === 0) {
    return 0;
  }

  return Math.min(...prices);
}
