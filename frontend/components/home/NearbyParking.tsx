"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Car,
  ChevronRight,
  Clock3,
  LoaderCircle,
  MapPin,
  Navigation,
  ParkingSquare,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getApprovedParkings } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Parking } from "@/types/parking";

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

function getParkingCoordinates(parking: Parking) {
  const item = parking as Parking & {
    location?: {
      latitude?: number;
      longitude?: number;
    };
  };

  if (
    typeof item.location?.latitude === "number" &&
    typeof item.location?.longitude === "number"
  ) {
    return {
      latitude: item.location.latitude,
      longitude: item.location.longitude,
    };
  }

  return null;
}

function getStartingPrice(parking: Parking): number | null {
  const prices = [
    parking.pricing?.twoWheeler?.hourly,
    parking.pricing?.fourWheeler?.hourly,
    parking.pricing?.vanMinibus?.hourly,
    parking.pricing?.heavyVehicle?.hourly,
  ].filter((price): price is number => typeof price === "number" && price >= 0);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

export default function NearbyParking() {
  const router = useRouter();

  const [directionLoadingId, setDirectionLoadingId] = useState<string | null>(
    null,
  );

const parkingQuery = useQuery({
  queryKey: ["home", "parkings"],
  queryFn: getApprovedParkings,
  staleTime: 60 * 1000,
});

  const parkings = parkingQuery.data ?? [];

  const openGoogleMapsDirections = (parking: Parking) => {
    const coordinates = getParkingCoordinates(parking);

    if (!coordinates) {
      alert("Parking location is unavailable.");
      return;
    }

    setDirectionLoadingId(parking._id);

    const destination = `${coordinates.latitude},${coordinates.longitude}`;

    const mapsTab = window.open("about:blank", "_blank");

    if (!mapsTab) {
      setDirectionLoadingId(null);

      alert(
        "Google Maps could not be opened. Please allow pop-ups for this site.",
      );

      return;
    }

    mapsTab.document.title = "Opening Google Maps...";

    mapsTab.document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#075e57;
        color:white;
        font-family:Arial,sans-serif;
        text-align:center;
      ">
        <div>
          <div style="
            width:44px;
            height:44px;
            margin:0 auto 20px;
            border:4px solid rgba(255,255,255,.25);
            border-top-color:white;
            border-radius:50%;
            animation:spin 1s linear infinite;
          "></div>

          <h2 style="
            margin:0;
            font-size:20px;
          ">
            Finding your location
          </h2>

          <p style="
            margin-top:8px;
            color:rgba(255,255,255,.65);
            font-size:14px;
          ">
            Preparing directions to ${parking.parkingName}
          </p>
        </div>

        <style>
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        </style>
      </div>
    `;

    const openDirections = (origin?: string) => {
      const params = new URLSearchParams({
        api: "1",
        destination,
        travelmode: "driving",
      });

      if (origin) {
        params.set("origin", origin);
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?${params.toString()}`;

      mapsTab.location.href = googleMapsUrl;

      setDirectionLoadingId(null);
    };

    if (!navigator.geolocation) {
      openDirections();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;

        openDirections(origin);
      },
      () => {
        openDirections();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <section
      id="nearby-parking"
      className="relative isolate overflow-hidden bg-[#075e57] px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 78px)",
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 38px, rgba(20,184,166,0.12) 38px, rgba(20,184,166,0.12) 39px)",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-300/15 blur-3xl" />

        <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-100 shadow-lg backdrop-blur-xl">
              <MapPin className="h-3.5 w-3.5" />
              Parking near you
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find a parking spot
              <span className="mt-1 block text-teal-200">
                when you need it.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Discover verified parking locations, check availability, and
              reserve your spot before you arrive.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/driver/parkings")}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
          >
            View all parking
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {parkingQuery.isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
            <ParkingCardSkeleton />
          </div>
        )}

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

        {!parkingQuery.isLoading &&
          !parkingQuery.isError &&
          parkings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {parkings.slice(0, 6).map((parking) => {
                const image = parking.images?.[0]?.url;
                const startingPrice = getStartingPrice(parking);
                const isDirectionLoading = directionLoadingId === parking._id;

                return (
                  <article
                    key={parking._id}
                    className="group overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-teal-200/30 hover:bg-white/[0.14]"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <ParkingImage src={image} name={parking.parkingName} />

                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-lg backdrop-blur-xl">
                        {parking.parkingType}
                      </div>

                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-300" />

                        <span>
                          {typeof parking.averageRating === "number"
                            ? parking.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 text-xs font-medium text-white/90">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-200" />

                        <span className="truncate">
                          {parking.city}, {parking.state}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 truncate text-lg font-semibold text-white">
                          {parking.parkingName}
                        </h3>

                        {startingPrice !== null && (
                          <div className="shrink-0 text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
                              From
                            </p>

                            <p className="text-lg font-black text-teal-200">
                              ₹{startingPrice}
                              <span className="ml-1 text-[10px] font-medium text-white/40">
                                /hr
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-start gap-2 text-sm leading-5 text-white/60">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />

                        <div className="min-w-0">
                          <p className="line-clamp-2">{parking.address}</p>

                          <p className="mt-1 text-xs text-white/40">
                            {parking.city}, {parking.state} - {parking.pincode}
                          </p>
                        </div>
                      </div>

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

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/driver/parkings/${parking._id}`)
                          }
                          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#075e57] shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50 active:translate-y-0 active:scale-[0.98]"
                        >
                          View parking
                        </button>

                        <button
                          type="button"
                          aria-label={`Get directions to ${parking.parkingName}`}
                          title="Get directions"
                          disabled={isDirectionLoading}
                          onClick={() => openGoogleMapsDirections(parking)}
                          className="group/navigation relative flex min-w-[58px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 px-3 text-white/80 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white active:translate-y-0 active:scale-95 disabled:cursor-wait disabled:opacity-90"
                        >
                          <span
                            className={`absolute inset-0 bg-teal-300/10 transition-opacity duration-200 ${
                              isDirectionLoading ? "opacity-100" : "opacity-0"
                            }`}
                          />

                          {isDirectionLoading ? (
                            <LoaderCircle className="relative h-5 w-5 animate-spin text-teal-200" />
                          ) : (
                            <Navigation className="relative h-5 w-5 transition-transform duration-200 group-hover/navigation:scale-110 group-hover/navigation:-rotate-12" />
                          )}
                        </button>
                      </div>

                      {isDirectionLoading && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-teal-100/70">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-200" />
                          Getting your location and opening directions...
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

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
