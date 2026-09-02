"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getApiErrorMessage } from "@/lib/api-error";
import { getParkingDetails } from "@/services/parking.service";

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
    queryKey: ["driver-parking-details", parkingId],
    queryFn: () => getParkingDetails(parkingId),
    enabled: parkingId.length > 0,
  });

  if (parkingQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[#18145f] text-white">
        <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden px-4">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_80px,transparent_80px,transparent_160px)]" />

          <div className="relative rounded-3xl border border-white/10 bg-white/10 px-8 py-7 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white text-[#4338ff]">
              <MapPin className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm font-semibold">
              Loading parking details...
            </p>

            <p className="mt-1 text-xs text-white/50">Please wait a moment</p>
          </div>
        </div>
      </main>
    );
  }

  if (parkingQuery.isError) {
    return (
      <main className="min-h-screen bg-[#18145f] text-white">
        <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden px-4">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_80px,transparent_80px,transparent_160px)]" />

          <div className="relative">
            <ErrorState
              message={getApiErrorMessage(parkingQuery.error)}
              onBack={() => router.push("/driver/parkings")}
            />
          </div>
        </div>
      </main>
    );
  }

  const details = parkingQuery.data;

  if (!details?.parking) {
    return (
      <main className="min-h-screen bg-[#18145f] text-white">
        <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden px-4">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_80px,transparent_80px,transparent_160px)]" />

          <div className="relative">
            <ErrorState
              message="Parking not found."
              onBack={() => router.push("/driver/parkings")}
            />
          </div>
        </div>
      </main>
    );
  }

  const parking = details.parking;

  const slots = details.availability?.slots ?? [];

  const totalAvailableSlots =
    details.availability?.totalAvailableSlots ?? slots.length;

  const images = parking.images ?? [];

  const facilities = parking.facilities ?? [];

  const rules = parking.rules ?? [];

  const averageRating =
    typeof parking.averageRating === "number" ? parking.averageRating : 0;

  const totalReviews =
    typeof parking.totalReviews === "number" ? parking.totalReviews : 0;

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

  const hasCoordinates =
    typeof parking.location?.latitude === "number" &&
    typeof parking.location?.longitude === "number";

  const openGoogleMaps = () => {
    if (!hasCoordinates) {
      return;
    }

    const latitude = parking.location.latitude;
    const longitude = parking.location.longitude;

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${latitude},${longitude}` +
      `&travelmode=driving`;

    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#18145f] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_80px,transparent_80px,transparent_160px)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="overflow-hidden mt-18 rounded-[28px] border border-white/10 bg-[#2f2c6f] text-zinc-900 shadow-2xl">
            <div className="relative">
              {images.length > 0 ? (
                <Image
                  src={images[0].url}
                  alt={parking.parkingName}
                  width={1400}
                  height={650}
                  priority
                  className="h-[280px] w-full object-cover sm:h-[380px]"
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center bg-[#201C64] text-zinc-400 sm:h-[380px]">
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10" />

                    <p className="mt-2 text-sm font-semibold">
                      No parking image
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute left-5 top-5">
                <span className="rounded-full bg-transparent/90 px-4 py-2 text-xs font-bold capitalize text-white shadow-lg">
                  {formatLabel(parking.parkingType)}
                </span>
              </div>

              <button
                type="button"
                onClick={openGoogleMaps}
                disabled={!hasCoordinates}
                className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#4338ff] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl text-white font-black tracking-tight sm:text-4xl">
                      {parking.parkingName}
                    </h1>

                    {parking.isTemporarilyClosed && (
                      <span className="rounded-full bg-[#2F2C6F] px-3 py-1.5 text-xs font-bold text-red-600">
                        Temporarily closed
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#4338ff]">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-zinc-200">
                        {parking.address}
                      </p>

                      {parking.landmark && (
                        <p className="mt-1 text-sm text-zinc-200">
                          Near {parking.landmark}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-zinc-300">
                        {parking.city}, {parking.state} - {parking.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex  shrink-0 items-center gap-3 rounded-2xl bg-zinc-100 px-5 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-yellow-500 shadow-sm">
                    <Star className="h-5 w-5 fill-current" />
                  </div>

                  <div>
                    <p className="text-lg font-black text-zinc-900">
                      {averageRating.toFixed(1)}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>

              {parking.description && (
                <p className="mt-7 max-w-4xl leading-7 text-white">
                  {parking.description}
                </p>
              )}

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailCard
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Operating hours"
                  value={`${operatingHours.open} - ${operatingHours.close}`}
                />

                <DetailCard
                  icon={<CarFront className="h-5 w-5" />}
                  label="Available slots"
                  value={`${totalAvailableSlots} available`}
                />

                <DetailCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={
                    hasCoordinates
                      ? "Location available"
                      : "Location unavailable"
                  }
                />

                <DetailCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Status"
                  value={
                    parking.isTemporarilyClosed
                      ? "Temporarily closed"
                      : "Available"
                  }
                />
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <InfoSection title="Parking owner">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
                    <span className="text-sm font-black">
                      {getInitials(parking.ownerName)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Parking owner
                    </p>

                    <p className="truncate font-bold text-zinc-900">
                      {parking.ownerName || "Not available"}
                    </p>

                    {parking.contactNumber && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {parking.contactNumber}
                      </p>
                    )}
                  </div>
                </div>

                {parking.contactNumber && (
                  <a
                    href={`tel:${parking.contactNumber}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm transition hover:scale-105"
                    aria-label="Call parking owner"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                )}
              </div>
            </InfoSection>

            <InfoSection title="Facilities">
              <div className="flex flex-wrap gap-2">
                {facilities.length > 0 ? (
                  facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-xl bg-[#eef0ff] px-3 py-2 text-sm font-semibold capitalize text-[#4338ff]"
                    >
                      {formatLabel(facility)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No facilities listed.</p>
                )}
              </div>
            </InfoSection>

            <InfoSection title="Booking modes">
              <div className="space-y-2">
                {bookingModes.hourly && <BookingMode label="Hourly" />}

                {bookingModes.daily && <BookingMode label="Daily" />}

                {bookingModes.monthly && <BookingMode label="Monthly" />}

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

          <section className="mt-6 rounded-[28px] border border-white/10 bg-white p-6 text-zinc-900 shadow-xl sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black">Pricing</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Parking charges by vehicle type and booking mode.
                </p>
              </div>

              <span className="rounded-full bg-[#eef0ff] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#4338ff]">
                {pricing.currency || "INR"}
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="pb-4">Vehicle</th>

                    <th className="pb-4">Hourly</th>

                    <th className="pb-4">Daily</th>

                    <th className="pb-4">Monthly</th>
                  </tr>
                </thead>

                <tbody>
                  {parking.supportedVehicleTypes?.includes("twoWheeler") && (
                    <PricingRow
                      name="Bike"
                      pricing={pricing.twoWheeler}
                      currency={pricing.currency}
                    />
                  )}

                  {parking.supportedVehicleTypes?.includes("fourWheeler") && (
                    <PricingRow
                      name="Car"
                      pricing={pricing.fourWheeler}
                      currency={pricing.currency}
                    />
                  )}

                  {parking.supportedVehicleTypes?.includes("vanMinibus") && (
                    <PricingRow
                      name="Van / Minibus"
                      pricing={pricing.vanMinibus}
                      currency={pricing.currency}
                    />
                  )}

                  {parking.supportedVehicleTypes?.includes("heavyVehicle") && (
                    <PricingRow
                      name="Heavy Vehicle"
                      pricing={pricing.heavyVehicle}
                      currency={pricing.currency}
                    />
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <InfoSection title="Supported vehicles">
              <div className="flex flex-wrap gap-2">
                {(parking.supportedVehicleTypes ?? []).length > 0 ? (
                  parking.supportedVehicleTypes.map((type) => (
                    <span
                      key={type}
                      className="flex items-center gap-2 rounded-xl bg-[#eef0ff] px-4 py-2.5 text-sm font-semibold text-[#4338ff]"
                    >
                      <CarFront className="h-4 w-4" />

                      {formatVehicleType(type)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    No vehicle types specified.
                  </p>
                )}
              </div>
            </InfoSection>

            <InfoSection title="Parking rules">
              {rules.length > 0 ? (
                <ul className="space-y-3">
                  {rules.map((rule) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-sm text-zinc-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4338ff]" />

                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">
                  No parking rules listed.
                </p>
              )}
            </InfoSection>
          </div>

          <section className="mt-6 rounded-[28px] border border-white/10 bg-white p-6 text-zinc-900 shadow-xl sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black">Available slots</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {totalAvailableSlots}{" "}
                  {totalAvailableSlots === 1 ? "slot" : "slots"} currently
                  available
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef0ff] text-[#4338ff]">
                <CarFront className="h-5 w-5" />
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-zinc-50 p-8 text-center">
                <CarFront className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-3 font-semibold text-zinc-700">
                  No parking slots are currently available.
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Please check again later.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-[#cfd2ff] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-zinc-900">
                        Slot {slot.slotNumber}
                      </p>

                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600">
                        Available
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      Floor: {slot.floor}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(slot.supportedVehicleTypes ?? []).map((type) => (
                        <span
                          key={type}
                          className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#4338ff] shadow-sm"
                        >
                          {formatVehicleType(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 pb-10">
            <button
              type="button"
              disabled={slots.length === 0 || parking.isTemporarilyClosed}
              onClick={() => router.push(`/driver/parkings/${parkingId}/book`)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-black text-[#4338ff] shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {parking.isTemporarilyClosed
                ? "Parking Temporarily Closed"
                : slots.length === 0
                  ? "No Slots Available"
                  : "Book Parking"}

              {slots.length > 0 && !parking.isTemporarilyClosed && (
                <span>→</span>
              )}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

interface DetailCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
        {icon}
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-zinc-800">{value}</p>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white p-6 text-zinc-900 shadow-xl">
      <h2 className="mb-5 text-xl font-black">{title}</h2>

      {children}
    </section>
  );
}

function BookingMode({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-green-600" />

      <span className="text-sm font-semibold text-zinc-800">{label}</span>
    </div>
  );
}

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
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-4 font-bold text-zinc-800">{name}</td>

      <td className="py-4 font-semibold text-[#4338ff]">
        {formatPrice(pricing.hourly, currency)}
      </td>

      <td className="py-4 font-semibold text-[#4338ff]">
        {formatPrice(pricing.daily, currency)}
      </td>

      <td className="py-4 font-semibold text-[#4338ff]">
        {formatPrice(pricing.monthly, currency)}
      </td>
    </tr>
  );
}

function formatPrice(price: number | undefined, currency: string): string {
  if (typeof price !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatLabel(value: string | undefined | null): string {
  if (typeof value !== "string" || value.length === 0) {
    return "—";
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim();
}

function formatVehicleType(value: string): string {
  const labels: Record<string, string> = {
    twoWheeler: "Bike",
    fourWheeler: "Car",
    vanMinibus: "Van",
    heavyVehicle: "Heavy Vehicle",
  };

  return labels[value] ?? formatLabel(value);
}

function getInitials(name: string | undefined): string {
  if (!name) {
    return "PO";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({ message, onBack }: ErrorStateProps) {
  return (
    <div className="w-full max-w-lg rounded-[28px] border border-red-300/20 bg-red-950/40 p-7 shadow-2xl backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
        <MapPin className="h-6 w-6" />
      </div>

      <h1 className="mt-5 text-2xl font-black">Unable to load parking</h1>

      <p className="mt-2 text-sm leading-6 text-red-200/80">{message}</p>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#4338ff] transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to parking
      </button>
    </div>
  );
}
