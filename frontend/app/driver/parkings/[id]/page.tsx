"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getApiErrorMessage } from "@/lib/api-error";

import { getParking } from "@/services/parking.service";
import { getAvailableParkingSlots } from "@/services/parking-slot.service";

export default function ParkingDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <ParkingDetails />
    </ProtectedRoute>
  );
}

function ParkingDetails() {
  const router = useRouter();
  const params = useParams();

  const parkingId = typeof params.id === "string" ? params.id : "";

  const parkingQuery = useQuery({
    queryKey: ["parking", parkingId],

    queryFn: () => getParking(parkingId),

    enabled: parkingId.length > 0,
  });

  const slotsQuery = useQuery({
    queryKey: ["parking-slots", parkingId, "available"],

    queryFn: () => getAvailableParkingSlots(parkingId),

    enabled: parkingId.length > 0,
  });

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (parkingQuery.isLoading || slotsQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading parking details...</p>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * PARKING ERROR
   * --------------------------------------------------
   */

  if (parkingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(parkingQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * --------------------------------------------------
   * SLOT ERROR
   * --------------------------------------------------
   */

  if (slotsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(slotsQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * --------------------------------------------------
   * PARKING DATA
   * --------------------------------------------------
   */

const parking =
  parkingQuery.data?.data?.parking;
  if (!parking) {
    return (
      <ErrorState
        message="Parking not found."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * --------------------------------------------------
   * SAFE DEFAULTS
   * --------------------------------------------------
   */

  const images = parking.images ?? [];

  const facilities = parking.facilities ?? [];

  const rules = parking.rules ?? [];

  const averageRating =
    typeof parking.averageRating === "number" ? parking.averageRating : 0;

  const totalReviews =
    typeof parking.totalReviews === "number" ? parking.totalReviews : 0;

  const slots = slotsQuery.data?.data ?? [];

  const operatingHours = parking.operatingHours ?? {
    open: "—",
    close: "—",
  };

  const bookingModes = parking.bookingModes ?? {
    hourly: false,
    daily: false,
    monthly: false,
  };

  const pricing = parking.pricing ?? {
    currency: "INR",
    twoWheeler: {},
    fourWheeler: {},
    vanMinibus: {},
    heavyVehicle: {},
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/driver/parkings")}
          className="mb-6 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to parking
        </button>

        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {images.length > 0 ? (
            <Image
              src={images[0].url}
              alt={parking.parkingName}
              width={1200}
              height={600}
              priority
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-zinc-800 text-zinc-500">
              No parking image
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{parking.parkingName}</h1>

                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs capitalize text-zinc-300">
                    {formatLabel(parking.parkingType)}
                  </span>
                </div>

                <p className="mt-3 text-zinc-400">{parking.address}</p>

                <p className="mt-1 text-sm text-zinc-500">
                  {parking.city}, {parking.state} {parking.pincode}
                </p>

                {parking.landmark && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Landmark: {parking.landmark}
                  </p>
                )}
              </div>

              <div className="text-left md:text-right">
                <p className="text-yellow-400">★ {averageRating.toFixed(1)}</p>

                <p className="mt-1 text-sm text-zinc-500">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {parking.description && (
              <p className="mt-6 max-w-3xl leading-7 text-zinc-400">
                {parking.description}
              </p>
            )}
          </div>
        </section>

        {/* Information */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Facilities */}
          <InfoSection title="Facilities">
            <div className="flex flex-wrap gap-2">
              {facilities.length > 0 ? (
                facilities.map((facility) => (
                  <span
                    key={facility}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm capitalize text-zinc-300"
                  >
                    {formatLabel(facility)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No facilities listed.</p>
              )}
            </div>
          </InfoSection>

          {/* Operating Hours */}
          <InfoSection title="Operating hours">
            <p className="text-zinc-300">
              {operatingHours.open}
              {" - "}
              {operatingHours.close}
            </p>
          </InfoSection>

          {/* Booking Modes */}
          <InfoSection title="Booking modes">
            <div className="space-y-2">
              {bookingModes.hourly && (
                <p className="text-sm text-zinc-300">✓ Hourly</p>
              )}

              {bookingModes.daily && (
                <p className="text-sm text-zinc-300">✓ Daily</p>
              )}

              {bookingModes.monthly && (
                <p className="text-sm text-zinc-300">✓ Monthly</p>
              )}

              {!bookingModes.hourly &&
                !bookingModes.daily &&
                !bookingModes.monthly && (
                  <p className="text-sm text-zinc-500">
                    No booking modes available.
                  </p>
                )}
            </div>
          </InfoSection>
        </div>

        {/* Pricing */}
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Pricing</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3">Vehicle</th>

                  <th className="pb-3">Hourly</th>

                  <th className="pb-3">Daily</th>

                  <th className="pb-3">Monthly</th>
                </tr>
              </thead>

              <tbody>
                <PricingRow
                  name="Two Wheeler"
                  pricing={pricing.twoWheeler}
                  currency={pricing.currency}
                />

                <PricingRow
                  name="Four Wheeler"
                  pricing={pricing.fourWheeler}
                  currency={pricing.currency}
                />

                <PricingRow
                  name="Van / Minibus"
                  pricing={pricing.vanMinibus}
                  currency={pricing.currency}
                />

                <PricingRow
                  name="Heavy Vehicle"
                  pricing={pricing.heavyVehicle}
                  currency={pricing.currency}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Rules */}
        {rules.length > 0 && (
          <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Parking rules</h2>

            <ul className="mt-4 space-y-3">
              {rules.map((rule) => (
                <li key={rule} className="text-sm text-zinc-400">
                  • {rule}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Slots */}
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Available slots</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {slots.length} {slots.length === 1 ? "slot" : "slots"} available
              </p>
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="mt-6 rounded-xl bg-zinc-950 p-6 text-center text-zinc-500">
              No parking slots are currently available.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="font-semibold">Slot {slot.slotNumber}</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Floor: {slot.floor}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(slot.supportedVehicleTypes ?? []).map((type) => (
                      <span
                        key={type}
                        className="rounded-md bg-zinc-800 px-2 py-1 text-xs capitalize text-zinc-400"
                      >
                        {formatLabel(type)}
                      </span>
                    ))}
                  </div>

                  <span className="mt-4 inline-block rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                    Available
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Book button */}
        <section className="mt-6">
          <button
            type="button"
            disabled={slots.length === 0}
            onClick={() => router.push(`/driver/parkings/${parkingId}/book`)}
            className="w-full rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {slots.length === 0 ? "No Slots Available" : "Book Parking"}
          </button>
        </section>
      </div>
    </main>
  );
}

/*
 * --------------------------------------------------
 * INFO SECTION
 * --------------------------------------------------
 */

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      {children}
    </section>
  );
}

/*
 * --------------------------------------------------
 * PRICING
 * --------------------------------------------------
 */

interface PricingRowProps {
  name: string;

  pricing: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };

  currency: string;
}

function PricingRow({ name, pricing, currency }: PricingRowProps) {
  return (
    <tr className="border-b border-zinc-800 last:border-0">
      <td className="py-4 text-zinc-300">{name}</td>

      <td className="py-4">{formatPrice(pricing.hourly, currency)}</td>

      <td className="py-4">{formatPrice(pricing.daily, currency)}</td>

      <td className="py-4">{formatPrice(pricing.monthly, currency)}</td>
    </tr>
  );
}

function formatPrice(price: number | undefined, currency: string): string {
  if (typeof price !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(price);
}

/*
 * --------------------------------------------------
 * LABEL FORMATTER
 * --------------------------------------------------
 */

function formatLabel(value: string | undefined | null): string {
  if (typeof value !== "string" || value.length === 0) {
    return "—";
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim();
}

/*
 * --------------------------------------------------
 * ERROR STATE
 * --------------------------------------------------
 */

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({ message, onBack }: ErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <h1 className="text-xl font-semibold">Unable to load parking</h1>

        <p className="mt-2 text-sm text-red-300">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Back to parking
        </button>
      </div>
    </main>
  );
}
