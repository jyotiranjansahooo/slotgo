"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Edit3,
  ImageIcon,
  MapPin,
  ParkingSquare,
  ShieldCheck,
  User,
} from "lucide-react";

import OwnerNavbar from "@/components/owner/OwnerNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getParking } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";

import type { Parking } from "@/types/parking";

export default function OwnerParkingViewPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerParkingView />
    </ProtectedRoute>
  );
}

function OwnerParkingView() {
  const router = useRouter();
  const params = useParams();

  const parkingId = String(params.id);

  const parkingQuery = useQuery({
    queryKey: ["owner", "parking", parkingId],
    queryFn: () => getParking(parkingId),
    enabled: Boolean(parkingId),
  });

  if (parkingQuery.isLoading) {
    return <Loading />;
  }

  if (parkingQuery.isError) {
    return (
      <main className="min-h-screen bg-[#06544E] text-white">
        <OwnerNavbar />

        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-3xl border border-red-300/10 bg-red-500/10 p-8 text-center">
            <h1 className="text-xl font-semibold">Unable to load parking</h1>

            <p className="mt-2 text-sm text-white/50">
              {getApiErrorMessage(parkingQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#06544E]"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const parking = parkingQuery.data;

  if (!parking) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#06544E] text-white">
      <OwnerNavbar />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/owner/parkings")}
            className="inline-flex w-fit items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my parkings
          </button>

          <button
            type="button"
            onClick={() => router.push(`/owner/parkings/${parking._id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#06544E]"
          >
            <Edit3 className="h-4 w-4" />
            Edit parking
          </button>
        </div>

        {/* TITLE */}

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <ParkingSquare className="h-7 w-7" />

            <h1 className="text-3xl font-bold sm:text-4xl">
              {parking.parkingName}
            </h1>

            <Status status={parking.status} />
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-white/50">
            <MapPin className="h-4 w-4" />

            {parking.address}
          </div>
        </div>

        {/* IMAGES */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parking.images?.map((image, index) => (
            <div
              key={image.publicId || index}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <img
                src={image.url}
                alt={`${parking.parkingName} image ${index + 1}`}
                className="h-64 w-full object-cover"
              />
            </div>
          ))}
        </section>

        {/* BASIC INFO */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard
            icon={<ParkingSquare className="h-5 w-5" />}
            label="Parking type"
            value={formatParkingType(parking.parkingType)}
          />

          <DetailCard
            icon={<MapPin className="h-5 w-5" />}
            label="City"
            value={`${parking.city ?? "Unknown"}, ${parking.state ?? "Unknown"}`}
          />

          <DetailCard
            icon={<ParkingSquare className="h-5 w-5" />}
            label="Parking area"
            value={
              typeof parking.parkingArea === "number"
                ? `${parking.parkingArea}`
                : "Not provided"
            }
          />

          <DetailCard
            icon={<User className="h-5 w-5" />}
            label="Owner"
            value={parking.ownerName ?? "Not provided"}
          />

          <DetailCard
            icon={<CarFront className="h-5 w-5" />}
            label="Contact"
            value={parking.contactNumber ?? "Not provided"}
          />

          <DetailCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Operating hours"
            value={`${parking.operatingHours?.open ?? "--"} - ${
              parking.operatingHours?.close ?? "--"
            }`}
          />
        </section>

        {/* DESCRIPTION */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Description</h2>

          <p className="mt-3 text-sm leading-7 text-white/55">
            {parking.description || "No description provided."}
          </p>
        </section>

        {/* FACILITIES */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />

            <h2 className="text-lg font-semibold">Facilities</h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {parking.facilities?.length ? (
              parking.facilities.map((facility:string) => (
                <span
                  key={facility}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65"
                >
                  {facility}
                </span>
              ))
            ) : (
              <p className="text-sm text-white/40">No facilities added.</p>
            )}
          </div>
        </section>

        {/* RULES */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-200" />

            <h2 className="text-lg font-semibold">Parking rules</h2>
          </div>

          <ul className="mt-4 space-y-2">
            {parking.rules?.length ? (
              parking.rules.map((rule:string) => (
                <li
                  key={rule}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/60"
                >
                  {rule}
                </li>
              ))
            ) : (
              <li className="text-sm text-white/40">No rules added.</li>
            )}
          </ul>
        </section>

        {/* BOOKING MODES */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-200" />

            <h2 className="text-lg font-semibold">Booking modes</h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {parking.bookingModes?.hourly && <ModeBadge label="Hourly" />}

            {parking.bookingModes?.daily && <ModeBadge label="Daily" />}

            {parking.bookingModes?.monthly && <ModeBadge label="Monthly" />}
          </div>
        </section>

        {/* PRICING */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Pricing</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PriceCard
              label="Two Wheeler"
              pricing={parking.pricing?.twoWheeler}
            />

            <PriceCard
              label="Four Wheeler"
              pricing={parking.pricing?.fourWheeler}
            />

            <PriceCard
              label="Van / Minibus"
              pricing={parking.pricing?.vanMinibus}
            />

            <PriceCard
              label="Heavy Vehicle"
              pricing={parking.pricing?.heavyVehicle}
            />
          </div>
        </section>

        {/* LOCATION */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-200" />

            <h2 className="text-lg font-semibold">Location</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailCard
              icon={<MapPin className="h-5 w-5" />}
              label="Latitude"
              value={String(parking.location?.latitude ?? "Not set")}
            />

            <DetailCard
              icon={<MapPin className="h-5 w-5" />}
              label="Longitude"
              value={String(parking.location?.longitude ?? "Not set")}
            />
          </div>
        </section>
      </section>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-3 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Status({ status }: { status: Parking["status"] }) {
  return (
    <span className="rounded-full border border-amber-200/10 bg-amber-300/10 px-3 py-1.5 text-xs font-medium capitalize text-amber-100">
      {status}
    </span>
  );
}

function ModeBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-emerald-200/10 bg-emerald-300/10 px-4 py-2 text-xs font-medium text-emerald-100">
      {label}
    </span>
  );
}

function PriceCard({
  label,
  pricing,
}: {
  label: string;
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-white/40">{label}</p>

      <div className="mt-3 space-y-2 text-sm">
        <p>
          Hourly: <strong>₹{pricing?.hourly ?? 0}</strong>
        </p>

        <p>
          Daily: <strong>₹{pricing?.daily ?? 0}</strong>
        </p>

        <p>
          Monthly: <strong>₹{pricing?.monthly ?? 0}</strong>
        </p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <main className="min-h-screen bg-[#06544E] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-6 w-40 rounded bg-white/10" />

        <div className="mt-8 h-10 w-72 rounded bg-white/10" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}

function formatParkingType(type: Parking["parkingType"]): string {
  switch (type) {
    case "open":
      return "Open";

    case "covered":
      return "Covered";

    case "basement":
      return "Basement";

    case "multiLevel":
      return "Multi Level";

    case "street":
      return "Street";

    default:
      return type;
  }
}
