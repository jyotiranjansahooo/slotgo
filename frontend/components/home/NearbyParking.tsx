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

/*
 * =============================================================
 * SKELETON
 * =============================================================
 */

function ParkingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.09] shadow-2xl backdrop-blur-xl">
      <div className="h-52 animate-pulse bg-white/10" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-white/10" />

        <div className="h-4 w-full animate-pulse rounded-lg bg-white/10" />

        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-white/10" />

        <div className="h-11 w-full animate-pulse rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

/*
 * =============================================================
 * PARKING IMAGE
 * =============================================================
 */

function ParkingImage({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0f766e]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_70px)]" />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl">
        <ParkingSquare className="h-10 w-10 text-teal-200/70" />
      </div>
    </div>
  );
}

/*
 * =============================================================
 * MAIN
 * =============================================================
 */

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
      className="relative isolate overflow-hidden bg-[#075e57] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      {/* ======================================================
          BACKGROUND
         ====================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Vertical stripes */}

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 78px)",
          }}
        />

        {/* Secondary fine stripes */}

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 38px, rgba(20,184,166,0.12) 38px, rgba(20,184,166,0.12) 39px)",
          }}
        />

        {/* Top glow */}

        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-300/15 blur-3xl" />

        {/* Right glow */}

        <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl" />

        {/* Bottom glow */}

        <div className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-emerald-300/10 blur-3xl" />

        {/* Dark overlay for readability */}

        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* ======================================================
          CONTENT
         ====================================================== */}

      <div className="relative mx-auto max-w-7xl">
        {/* ====================================================
            HEADER
           ==================================================== */}

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {/* LABEL */}

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-100 shadow-lg backdrop-blur-xl">
              <MapPin className="h-3.5 w-3.5" />
              Parking near you
            </div>

            {/* TITLE */}

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find a parking spot
              <span className="mt-1 block text-teal-200">
                when you need it.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Discover verified parking locations, check availability, and
              reserve your spot before you arrive.
            </p>
          </div>

          {/* VIEW ALL */}

          <button
            type="button"
            onClick={() => router.push("/driver/parkings")}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
          >
            View all parking
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* ====================================================
            LOADING
           ==================================================== */}

        {parkingQuery.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
          </div>
        )}

        {/* ====================================================
            ERROR
           ==================================================== */}

        {parkingQuery.isError && (
          <div className="rounded-[1.75rem] border border-red-300/15 bg-red-500/10 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200/10 bg-red-500/10">
              <Navigation className="h-6 w-6 text-red-200" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Unable to load parking
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-100/60">
              {getApiErrorMessage(parkingQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => parkingQuery.refetch()}
              className="mt-6 rounded-xl border border-white/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#075e57] shadow-lg transition hover:bg-white/90"
            >
              Try again
            </button>
          </div>
        )}

        {/* ====================================================
            EMPTY
           ==================================================== */}

        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length === 0 && (
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <ParkingSquare className="h-8 w-8 text-teal-100/60" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No parking locations available
              </h3>

              <p className="mt-2 text-sm text-white/50">
                Check again later for available parking locations.
              </p>
            </div>
          )}

        {/* ====================================================
            PARKING GRID
           ==================================================== */}

        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {parkings.slice(0, 6).map((parking) => {
                const image = parking.images?.[0]?.url;

                return (
                  <article
                    key={parking._id}
                    className="group overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-teal-200/30 hover:bg-white/[0.14]"
                  >
                    {/* ==================================================
                        IMAGE
                       ================================================== */}

                    <div className="relative h-52 overflow-hidden">
                      <ParkingImage src={image} name={parking.parkingName} />

                      {/* IMAGE OVERLAY */}

                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* TYPE */}

                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-lg backdrop-blur-xl">
                        {parking.parkingType}
                      </div>

                      {/* RATING */}

                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-300" />

                        <span>
                          {typeof parking.averageRating === "number"
                            ? parking.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                      </div>

                      {/* LOCATION */}

                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white/80">
                        <MapPin className="h-3.5 w-3.5 text-teal-200" />

                        <span>{parking.city}</span>
                      </div>
                    </div>

                    {/* ==================================================
                        CONTENT
                       ================================================== */}

                    <div className="p-5">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {parking.parkingName}
                      </h3>

                      <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-white/50">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />

                        <span className="line-clamp-2">{parking.address}</span>
                      </p>

                      {/* ==================================================
                          META
                         ================================================== */}

                      <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Star className="h-3.5 w-3.5 text-amber-300" />

                          <span>{parking.totalReviews ?? 0} reviews</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Clock3 className="h-3.5 w-3.5 text-teal-200" />

                          <span>Available</span>
                        </div>
                      </div>

                      {/* ==================================================
                          ACTIONS
                         ================================================== */}

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/driver/parkings/${parking._id}`)
                          }
                          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#075e57] shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50"
                        >
                          View parking
                        </button>

                        <button
                          type="button"
                          aria-label={`View ${parking.parkingName}`}
                          onClick={() =>
                            router.push(`/driver/parkings/${parking._id}`)
                          }
                          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 text-white/70 transition hover:bg-white/15 hover:text-white"
                        >
                          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* ====================================================
            BOTTOM CTA
           ==================================================== */}

        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length > 6 && (
            <div className="mt-9 text-center">
              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <Car className="h-4 w-4 text-teal-100" />
                Explore all parking spots
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
      </div>
    </section>
  );
}
