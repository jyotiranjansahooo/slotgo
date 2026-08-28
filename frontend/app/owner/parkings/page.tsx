"use client";

import OwnerNavbar from "@/components/owner/OwnerNavbar";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CarFront,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  ImageIcon,
  MapPin,
  ParkingSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";

import { getMyParkings } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";

import type { Parking } from "@/types/parking";

export default function OwnerParkingsPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerParkings />
    </ProtectedRoute>
  );
}

function OwnerParkings() {
  const router = useRouter();
  const { user } = useAuth();

  const parkingsQuery = useQuery({
    queryKey: ["owner", "parkings"],
    queryFn: getMyParkings,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const parkings: Parking[] = parkingsQuery.data ?? [];

  const activeParkings = parkings.filter((parking) => parking.isActive);

  const approvedParkings = parkings.filter(
    (parking) => parking.status === "approved",
  );

  const pendingParkings = parkings.filter(
    (parking) => parking.status === "pending",
  );

  const rejectedParkings = parkings.filter(
    (parking) => parking.status === "rejected",
  );

  const incompleteParkings = parkings.filter(
    (parking) => !isParkingDetailsComplete(parking),
  );

  const completeParkings = parkings.filter((parking) =>
    isParkingDetailsComplete(parking),
  );

  if (parkingsQuery.isLoading) {
    return <OwnerParkingsLoading />;
  }

  if (parkingsQuery.isError) {
    return (
      <OwnerParkingsError
        message={getApiErrorMessage(parkingsQuery.error)}
        onRetry={() => parkingsQuery.refetch()}
        onBack={() => router.push("/owner")}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06544E] text-white">
      <OwnerNavbar />

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.025)_50%,rgba(255,255,255,0.025)_75%,transparent_75%)] bg-[length:90px_90px]" />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-teal-300/5 blur-[130px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl">
                <ParkingSquare className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-sm font-medium text-white/55">
                  Parking management
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  My Parkings
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Manage your parking locations, complete your parking information,
              monitor approval status, and manage your parking slots.
            </p>
          </div>

          {/* ADD PARKING */}

          <button
            type="button"
            onClick={() => router.push("/owner/parkings/add")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#06544E] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
          >
            <Plus className="h-4 w-4" />
            Add Parking
          </button>
        </div>

        {/* =====================================================
            DETAILS REQUIREMENT NOTICE
        ====================================================== */}

        {incompleteParkings.length > 0 && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-300/15 bg-amber-500/10 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10">
                <AlertCircle className="h-5 w-5 text-amber-200" />
              </div>

              <div>
                <p className="text-sm font-semibold text-amber-100">
                  Parking details require attention
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-100/60">
                  {incompleteParkings.length} parking{" "}
                  {incompleteParkings.length === 1
                    ? "location is"
                    : "locations are"}{" "}
                  missing required information. Complete the details before
                  creating or managing parking slots.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`/owner/parkings/${incompleteParkings[0]._id}/edit`)
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
            >
              Complete details
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <OwnerStatCard
            label="Total parkings"
            value={parkings.length}
            icon={<ParkingSquare className="h-5 w-5" />}
          />

          <OwnerStatCard
            label="Active"
            value={activeParkings.length}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <OwnerStatCard
            label="Approved"
            value={approvedParkings.length}
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <OwnerStatCard
            label="Pending"
            value={pendingParkings.length}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </section>

        {/* =====================================================
            REJECTED
        ====================================================== */}

        {rejectedParkings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-500/10 p-4 backdrop-blur-xl">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />

            <div>
              <p className="text-sm font-semibold text-red-100">
                {rejectedParkings.length} parking{" "}
                {rejectedParkings.length === 1
                  ? "location requires"
                  : "locations require"}{" "}
                attention
              </p>

              <p className="mt-1 text-sm text-red-200/65">
                Review the rejected parking locations and update their details
                if necessary.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {parkings.length === 0 ? (
          <EmptyParkings onAdd={() => router.push("/owner/parkings/add")} />
        ) : (
          <>
            {/* =================================================
                PARKING SUMMARY
            ================================================== */}

            <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/45">
                  Your parking locations
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Parking locations
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  {activeParkings.length} active{" "}
                  {activeParkings.length === 1 ? "location" : "locations"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200/70" />
                {completeParkings.length} complete
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {parkings.map((parking) => (
                <ParkingOwnerCard
                  key={parking._id}
                  parking={parking}
                  onView={() => router.push(`/owner/parkings/${parking._id}`)}
                  onEdit={() =>
                    router.push(`/owner/parkings/${parking._id}/edit`)
                  }
                  onSlots={() =>
                    router.push(`/owner/parkings/${parking._id}/slots`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function isParkingDetailsComplete(parking: Parking): boolean {
  const hasName = Boolean(parking.parkingName?.trim());

  const hasDescription = Boolean(parking.description?.trim());

  const hasParkingType = Boolean(parking.parkingType);

  const hasAddress = Boolean(parking.address?.trim());

  const hasCity = Boolean(parking.city?.trim());

  const hasState = Boolean(parking.state?.trim());

  const hasPincode = Boolean(parking.pincode?.trim());

  const hasParkingArea =
    typeof parking.parkingArea === "number" && parking.parkingArea > 0;

  const hasLocation =
    typeof parking.location?.latitude === "number" &&
    typeof parking.location?.longitude === "number" &&
    Number.isFinite(parking.location.latitude) &&
    Number.isFinite(parking.location.longitude);

  const hasOwnerName = Boolean(parking.ownerName?.trim());

  const hasContactNumber = Boolean(parking.contactNumber?.trim());

  const hasFacilities =
    Array.isArray(parking.facilities) && parking.facilities.length > 0;

  const hasRules = Array.isArray(parking.rules) && parking.rules.length > 0;

  const hasImages =
    Array.isArray(parking.images) &&
    parking.images.length >= 2 &&
    parking.images.length <= 5;

  const hasOpeningTime = Boolean(parking.operatingHours?.open?.trim());

  const hasClosingTime = Boolean(parking.operatingHours?.close?.trim());

  return (
    hasName &&
    hasDescription &&
    hasParkingType &&
    hasAddress &&
    hasCity &&
    hasState &&
    hasPincode &&
    hasParkingArea &&
    hasLocation &&
    hasOwnerName &&
    hasContactNumber &&
    hasFacilities &&
    hasRules &&
    hasImages &&
    hasOpeningTime &&
    hasClosingTime
  );
}

/*
 * =============================================================
 * GET MISSING DETAILS
 * =============================================================
 */

function getMissingParkingDetails(parking: Parking): string[] {
  const missing: string[] = [];

  if (!parking.parkingName?.trim()) {
    missing.push("Parking name");
  }

  if (!parking.description?.trim()) {
    missing.push("Description");
  }

  if (!parking.address?.trim()) {
    missing.push("Address");
  }

  if (!parking.city?.trim()) {
    missing.push("City");
  }

  if (!parking.state?.trim()) {
    missing.push("State");
  }

  if (!parking.pincode?.trim()) {
    missing.push("Pincode");
  }

  if (typeof parking.parkingArea !== "number" || parking.parkingArea <= 0) {
    missing.push("Parking area");
  }

  if (
    typeof parking.location?.latitude !== "number" ||
    typeof parking.location?.longitude !== "number"
  ) {
    missing.push("Live location");
  }

  if (!parking.ownerName?.trim()) {
    missing.push("Owner name");
  }

  if (!parking.contactNumber?.trim()) {
    missing.push("Contact number");
  }

  if (!Array.isArray(parking.facilities) || parking.facilities.length === 0) {
    missing.push("Facilities");
  }

  if (!Array.isArray(parking.rules) || parking.rules.length === 0) {
    missing.push("Rules");
  }

  if (!Array.isArray(parking.images) || parking.images.length < 2) {
    missing.push("At least 2 images");
  } else if (parking.images.length > 5) {
    missing.push("Maximum 5 images");
  }

  if (!parking.operatingHours?.open?.trim()) {
    missing.push("Opening time");
  }

  if (!parking.operatingHours?.close?.trim()) {
    missing.push("Closing time");
  }

  return missing;
}

/*
 * =============================================================
 * PARKING CARD
 * =============================================================
 */

function ParkingOwnerCard({
  parking,
  onView,
  onEdit,
  onSlots,
}: {
  parking: Parking;
  onView: () => void;
  onEdit: () => void;
  onSlots: () => void;
}) {
  const router = useRouter();

  const image = parking.images?.[0]?.url;

  const detailsComplete = isParkingDetailsComplete(parking);

  const missingDetails = getMissingParkingDetails(parking);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14]">
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div className="relative h-48 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={parking.parkingName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.06]">
            <ParkingSquare className="h-14 w-14 text-white/20" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* STATUS */}

        <div className="absolute left-4 top-4">
          <ParkingStatus status={parking.status} />
        </div>

        {/* TYPE */}

        <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium capitalize text-white backdrop-blur-md">
          {formatParkingType(parking.parkingType)}
        </span>

        {/* NAME */}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="truncate text-lg font-semibold text-white">
            {parking.parkingName || "Unnamed parking"}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
            <MapPin className="h-3.5 w-3.5" />

            {parking.city || "Unknown city"}
            {parking.state ? `, ${parking.state}` : ""}
          </p>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-white/50">
          {parking.address || "Parking address not provided."}
        </p>

        {/* ===================================================
            DETAILS STATUS
        ==================================================== */}

        {detailsComplete ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200/10 bg-emerald-300/5 px-3.5 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />

            <div>
              <p className="text-xs font-semibold text-emerald-100">
                Parking details complete
              </p>

              <p className="mt-0.5 text-[11px] text-emerald-100/45">
                Ready to manage parking slots
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-500/10 p-3.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-100">
                  Parking details incomplete
                </p>

                <p className="mt-1 text-[11px] leading-5 text-amber-100/55">
                  {missingDetails.slice(0, 3).join(", ")}
                  {missingDetails.length > 3
                    ? ` +${missingDetails.length - 3} more`
                    : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-100/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-100/15"
            >
              Complete details
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ===================================================
            INFO
        ==================================================== */}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoItem
            icon={<CarFront className="h-4 w-4" />}
            label="Reviews"
            value={String(parking.totalReviews ?? 0)}
          />

          <InfoItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Rating"
            value={
              typeof parking.averageRating === "number"
                ? parking.averageRating.toFixed(1)
                : "0.0"
            }
          />

          <InfoItem
            icon={<ImageIcon className="h-4 w-4" />}
            label="Images"
            value={`${parking.images?.length ?? 0}/5`}
          />

          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Area"
            value={
              typeof parking.parkingArea === "number"
                ? `${parking.parkingArea}`
                : "Not set"
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10">
            <User className="h-4 w-4 text-emerald-100/70" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-white/35">Owner</p>

            <p className="truncate text-sm font-medium text-white/80">
              {parking.ownerName || "Not provided"}
            </p>

            <p className="mt-0.5 truncate text-xs text-white/35">
              {parking.contactNumber || "Contact number not provided"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
          <span className="text-xs text-white/45">Parking status</span>

          <span
            className={
              parking.isActive
                ? "text-xs font-semibold text-emerald-200"
                : "text-xs font-semibold text-white/40"
            }
          >
            {parking.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            View
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        </div>

        <button
          type="button"
          disabled={!detailsComplete}
          onClick={() => {
            if (!detailsComplete) {
              router.push(`/owner/parkings/${parking._id}/edit`);
              return;
            }

            onSlots();
          }}
          className={
            detailsComplete
              ? "mt-3 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
              : "mt-3 flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/30"
          }
        >
          <span>
            {detailsComplete
              ? "Manage parking slots"
              : "Complete details to add slots"}
          </span>

          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function ParkingStatus({ status }: { status: Parking["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-md">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur-md">
        <Clock3 className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-100 backdrop-blur-md">
      <XCircle className="h-3.5 w-3.5" />
      Rejected
    </span>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function OwnerStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:bg-white/[0.14]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>

        <span className="text-sm text-white/50">{label}</span>
      </div>

      <p className="mt-5 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyParkings({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 px-5 py-16 text-center shadow-2xl backdrop-blur-xl sm:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#06544E] shadow-xl">
        <ParkingSquare className="h-8 w-8" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">Complete your parking details</h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/50">
        Before you can create parking slots, you need to add your parking
        location and complete the required information including live location,
        parking area, images, contact details, facilities, rules and operating
        hours.
      </p>

      {/* REQUIREMENTS */}

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
        <RequirementItem
          icon={<MapPin className="h-4 w-4" />}
          text="Parking address & live location"
        />

        <RequirementItem
          icon={<ParkingSquare className="h-4 w-4" />}
          text="Parking area"
        />

        <RequirementItem
          icon={<ImageIcon className="h-4 w-4" />}
          text="2–5 parking images"
        />

        <RequirementItem
          icon={<User className="h-4 w-4" />}
          text="Owner name & contact number"
        />

        <RequirementItem
          icon={<ShieldCheck className="h-4 w-4" />}
          text="Facilities & parking rules"
        />

        <RequirementItem
          icon={<Clock3 className="h-4 w-4" />}
          text="Opening & closing time"
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#06544E] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
      >
        <Plus className="h-4 w-4" />
        Add parking details
      </button>
    </section>
  );
}

function RequirementItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-100">
        {icon}
      </div>

      <span className="text-xs text-white/60">{text}</span>
    </div>
  );
}

function OwnerParkingsLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06544E] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-32 rounded bg-white/10" />

        <div className="mt-5 h-12 w-64 rounded-xl bg-white/10" />

        <div className="mt-4 h-5 max-w-xl rounded bg-white/10" />

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-[1.5rem] bg-white/10" />
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[620px] rounded-[1.75rem] bg-white/10"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function OwnerParkingsError({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06544E] px-4 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-200" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          Unable to load your parkings
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-100/70">{message}</p>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * PARKING TYPE
 * =============================================================
 */

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
