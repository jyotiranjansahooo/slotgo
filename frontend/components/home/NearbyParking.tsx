"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Car,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  ParkingSquare,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getParkings } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";

function ParkingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="h-52 animate-pulse bg-white/10" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />

        <div className="h-11 w-full animate-pulse rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

function ParkingImage({
  src,
  name,
}: {
  src?: string;
  name: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-blue-600/20">
      <ParkingSquare className="h-14 w-14 text-indigo-300/60" />
    </div>
  );
}

export default function NearbyParking() {
  const router = useRouter();

  const parkingQuery = useQuery({
    queryKey: ["home", "parkings"],
    queryFn: getParkings,
    staleTime: 60 * 1000,
  });

  const parkings = parkingQuery.data?.data ?? [];

  return (
    <section
      id="nearby-parking"
      className="relative overflow-hidden bg-[#080b18] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <MapPin className="h-3.5 w-3.5" />
              Parking near you
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find a parking spot
              <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                when you need it.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Discover verified parking locations, check availability, and
              reserve your spot before you arrive.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/driver/parkings")}
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
          >
            View all parking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* LOADING */}
        {parkingQuery.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
          </div>
        )}

        {/* ERROR */}
        {parkingQuery.isError && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
              <Navigation className="h-5 w-5 text-red-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              Unable to load parking
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {getApiErrorMessage(parkingQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => parkingQuery.refetch()}
              className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <ParkingSquare className="mx-auto h-10 w-10 text-slate-500" />

              <h3 className="mt-4 text-lg font-semibold">
                No parking locations available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Check again later for available parking locations.
              </p>
            </div>
          )}

        {/* PARKING GRID */}
        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {parkings.slice(0, 6).map((parking) => {
                const image = parking.images?.[0]?.url;

                return (
                  <article
                    key={parking._id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]"
                  >
                    {/* IMAGE */}
                    <div className="relative h-52 overflow-hidden">
                      <ParkingImage
                        src={image}
                        name={parking.parkingName}
                      />

                      {/* IMAGE OVERLAY */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                      {/* TYPE */}
                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium capitalize text-white backdrop-blur-md">
                        {parking.parkingType}
                      </div>

                      {/* RATING */}
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-400" />

                        <span>
                          {typeof parking.averageRating === "number"
                            ? parking.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                      </div>

                      {/* LOCATION */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-white/80">
                        <MapPin className="h-3.5 w-3.5" />

                        <span>{parking.city}</span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-5">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {parking.parkingName}
                      </h3>

                      <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-slate-400">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                        <span className="line-clamp-2">
                          {parking.address}
                        </span>
                      </p>

                      {/* META */}
                      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Star className="h-3.5 w-3.5 text-amber-400" />

                          <span>
                            {parking.totalReviews ?? 0} reviews
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock3 className="h-3.5 w-3.5 text-indigo-400" />

                          <span>Available</span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/driver/parkings/${parking._id}`)
                          }
                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold transition hover:from-indigo-500 hover:to-violet-500"
                        >
                          View parking
                        </button>

                        <button
                          type="button"
                          aria-label={`View ${parking.parkingName}`}
                          onClick={() =>
                            router.push(`/driver/parkings/${parking._id}`)
                          }
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 transition hover:bg-white/10"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* BOTTOM CTA */}
        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length > 6 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/15"
              >
                <Car className="h-4 w-4" />
                Explore all parking spots
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
      </div>
    </section>
  );
}