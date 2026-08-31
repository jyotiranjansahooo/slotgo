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
  Loader2,
  MapPin,
  ParkingSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  deleteOwnerParking,
  getMyParkings,
  requestParkingActionVerification,
  updateParkingAvailability,
  type ParkingAction,
} from "@/services/parking.service";

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
  const queryClient = useQueryClient();

  const [verificationOpen, setVerificationOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [selectedAction, setSelectedAction] = useState<ParkingAction | null>(
    null,
  );
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const parkingsQuery = useQuery({
    queryKey: ["owner", "parkings"],
    queryFn: getMyParkings,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const requestVerificationMutation = useMutation({
    mutationFn: ({
      parkingId,
      action,
    }: {
      parkingId: string;
      action: ParkingAction;
    }) => requestParkingActionVerification(parkingId, action),

    onSuccess: () => {
      setVerificationMessage("A verification code was sent to your email.");
      setActionError("");
      setOtp("");
    },

    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: ({
      parkingId,
      isTemporarilyClosed,
      reason,
      otp,
    }: {
      parkingId: string;
      isTemporarilyClosed: boolean;
      reason?: string;
      otp?: string;
    }) =>
      updateParkingAvailability(parkingId, {
        isTemporarilyClosed,
        reason,
        otp: otp ?? "",
      }),

    onSuccess: (_, variables) => {
      setVerificationOpen(false);
      setSelectedParking(null);
      setSelectedAction(null);
      setOtp("");
      setReason("");
      setVerificationMessage("");
      setActionError("");

      setSuccessMessage(
        variables.isTemporarilyClosed
          ? "Parking has been temporarily closed."
          : "Parking has been reopened.",
      );

      void queryClient.invalidateQueries({
        queryKey: ["owner", "parkings"],
      });
    },

    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ parkingId, otp }: { parkingId: string; otp: string }) =>
      deleteOwnerParking(parkingId, otp),

    onSuccess: () => {
      setVerificationOpen(false);
      setSelectedParking(null);
      setSelectedAction(null);
      setOtp("");
      setReason("");
      setVerificationMessage("");
      setActionError("");

      setSuccessMessage("Parking has been deleted successfully.");

      void queryClient.invalidateQueries({
        queryKey: ["owner", "parkings"],
      });
    },

    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
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

  function openVerification(parking: Parking, action: ParkingAction) {
    setSelectedParking(parking);
    setSelectedAction(action);
    setVerificationOpen(true);
    setOtp("");
    setReason("");
    setVerificationMessage("");
    setActionError("");
    setSuccessMessage("");

    void requestVerificationMutation.mutateAsync({
      parkingId: parking._id,
      action,
    });
  }

  function closeVerification() {
    if (
      requestVerificationMutation.isPending ||
      availabilityMutation.isPending ||
      deleteMutation.isPending
    ) {
      return;
    }

    setVerificationOpen(false);
    setSelectedParking(null);
    setSelectedAction(null);
    setOtp("");
    setReason("");
    setVerificationMessage("");
    setActionError("");
  }

  function handleVerificationSubmit() {
    if (!selectedParking || !selectedAction) {
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setActionError("Please enter a valid 6-digit verification code.");
      return;
    }

    setActionError("");

    if (selectedAction === "temporary-close") {
      availabilityMutation.mutate({
        parkingId: selectedParking._id,
        isTemporarilyClosed: true,
        reason: reason.trim(),
        otp,
      });

      return;
    }

    deleteMutation.mutate({
      parkingId: selectedParking._id,
      otp,
    });
  }

  function handleReopen(parking: Parking) {
    setActionError("");
    setSuccessMessage("");

    availabilityMutation.mutate({
      parkingId: parking._id,
      isTemporarilyClosed: false,
    });
  }

  function handleResend() {
    if (!selectedParking || !selectedAction) {
      return;
    }

    setOtp("");
    setActionError("");
    setVerificationMessage("");

    requestVerificationMutation.mutate({
      parkingId: selectedParking._id,
      action: selectedAction,
    });
  }

  if (parkingsQuery.isLoading) {
    return <OwnerParkingsLoading />;
  }

  if (parkingsQuery.isError) {
    return (
      <OwnerParkingsError
        message={getApiErrorMessage(parkingsQuery.error)}
        onRetry={() => void parkingsQuery.refetch()}
        onBack={() => router.push("/owner")}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06544E] text-white">
      <OwnerNavbar />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.025)_50%,rgba(255,255,255,0.025)_75%,transparent_75%)] bg-[length:90px_90px]" />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-teal-300/5 blur-[130px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
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

          <button
            type="button"
            onClick={() => router.push("/owner/parkings/add")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#06544E] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
          >
            <Plus className="h-4 w-4" />
            Add Parking
          </button>
        </div>

        {successMessage && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-200" />

            <p className="text-sm text-emerald-100">{successMessage}</p>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-auto rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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

        {rejectedParkings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-500/10 p-4 backdrop-blur-xl">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />

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

        {parkings.length === 0 ? (
          <EmptyParkings onAdd={() => router.push("/owner/parkings/add")} />
        ) : (
          <>
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
                  onTemporaryClose={() =>
                    openVerification(parking, "temporary-close")
                  }
                  onDelete={() => openVerification(parking, "delete")}
                  onReopen={() => handleReopen(parking)}
                  availabilityLoading={
                    availabilityMutation.isPending &&
                    availabilityMutation.variables?.parkingId === parking._id
                  }
                />
              ))}
            </div>
          </>
        )}
      </section>

      {verificationOpen && selectedParking && selectedAction && (
        <VerificationModal
          parking={selectedParking}
          action={selectedAction}
          otp={otp}
          reason={reason}
          message={verificationMessage}
          error={actionError}
          isSending={requestVerificationMutation.isPending}
          isSubmitting={
            availabilityMutation.isPending || deleteMutation.isPending
          }
          onOtpChange={setOtp}
          onReasonChange={setReason}
          onSubmit={handleVerificationSubmit}
          onResend={handleResend}
          onClose={closeVerification}
        />
      )}
    </main>
  );
}

function ParkingOwnerCard({
  parking,
  onView,
  onEdit,
  onSlots,
  onTemporaryClose,
  onDelete,
  onReopen,
  availabilityLoading,
}: {
  parking: Parking;
  onView: () => void;
  onEdit: () => void;
  onSlots: () => void;
  onTemporaryClose: () => void;
  onDelete: () => void;
  onReopen: () => void;
  availabilityLoading: boolean;
}) {
  const image = parking.images?.[0]?.url;

  const detailsComplete = isParkingDetailsComplete(parking);

  const missingDetails = getMissingParkingDetails(parking);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14]">
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

        <div className="absolute left-4 top-4">
          <ParkingStatus status={parking.status} />
        </div>

        <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium capitalize text-white backdrop-blur-md">
          {formatParkingType(parking.parkingType)}
        </span>

        {parking.isTemporarilyClosed && (
          <span className="absolute left-4 bottom-4 rounded-full border border-amber-300/20 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur-md">
            Temporarily closed
          </span>
        )}

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

      <div className="p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-white/50">
          {parking.address || "Parking address not provided."}
        </p>

        {parking.isTemporarilyClosed && (
          <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-500/10 p-3.5">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-100">
                  Temporarily closed
                </p>

                {parking.temporaryClosedReason && (
                  <p className="mt-1 text-[11px] leading-5 text-amber-100/55">
                    {parking.temporaryClosedReason}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onReopen}
              disabled={availabilityLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#06544E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {availabilityLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Reopen parking
            </button>
          </div>
        )}

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
          disabled={!detailsComplete || parking.isTemporarilyClosed}
          onClick={() => {
            if (!detailsComplete) {
              onEdit();
              return;
            }

            onSlots();
          }}
          className={
            detailsComplete && !parking.isTemporarilyClosed
              ? "mt-3 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#06544E] transition hover:bg-white/90"
              : "mt-3 flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/30"
          }
        >
          <span>
            {parking.isTemporarilyClosed
              ? "Reopen parking to manage slots"
              : detailsComplete
                ? "Manage parking slots"
                : "Complete details to add slots"}
          </span>

          <ArrowRight className="h-4 w-4" />
        </button>

        {parking.isActive && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {parking.isTemporarilyClosed ? (
              <button
                type="button"
                onClick={onReopen}
                disabled={availabilityLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/10 px-3 py-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/15 disabled:opacity-50"
              >
                {availabilityLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Reopen
              </button>
            ) : (
              <button
                type="button"
                onClick={onTemporaryClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/15 bg-amber-500/10 px-3 py-3 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/15"
              >
                <Clock3 className="h-4 w-4" />
                Temporary close
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/15 bg-red-500/10 px-3 py-3 text-xs font-semibold text-red-100 transition hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function VerificationModal({
  parking,
  action,
  otp,
  reason,
  message,
  error,
  isSending,
  isSubmitting,
  onOtpChange,
  onReasonChange,
  onSubmit,
  onResend,
  onClose,
}: {
  parking: Parking;
  action: ParkingAction;
  otp: string;
  reason: string;
  message: string;
  error: string;
  isSending: boolean;
  isSubmitting: boolean;
  onOtpChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onClose: () => void;
}) {
  const isDelete = action === "delete";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-[#075952] p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={isSending || isSubmitting}
          className="absolute right-4 top-4 rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className={
            isDelete
              ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15"
              : "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15"
          }
        >
          {isDelete ? (
            <Trash2 className="h-6 w-6 text-red-200" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-amber-200" />
          )}
        </div>

        <h2 className="mt-5 pr-8 text-xl font-bold">
          {isDelete ? "Delete parking" : "Temporarily close parking"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/50">
          {isDelete
            ? `Deleting "${parking.parkingName}" will deactivate this parking location.`
            : `Temporarily closing "${parking.parkingName}" will stop customers from using it until you reopen it.`}
        </p>

        {!isDelete && (
          <div className="mt-5">
            <label
              htmlFor="temporary-close-reason"
              className="mb-2 block text-xs font-medium text-white/55"
            >
              Reason
              <span className="ml-1 text-white/25">(optional)</span>
            </label>

            <textarea
              id="temporary-close-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="e.g. Maintenance work"
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
            />
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck className="h-5 w-5 text-emerald-100" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white/80">
                Email verification
              </p>

              <p className="mt-0.5 text-xs text-white/35">
                Enter the 6-digit code sent to your email.
              </p>
            </div>
          </div>

          {message && (
            <p className="mt-4 text-xs leading-5 text-emerald-200/80">
              {message}
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300/10 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-200" />

              <p className="text-xs leading-5 text-red-100/80">{error}</p>
            </div>
          )}

          <div className="mt-4">
            <label
              htmlFor="parking-action-otp"
              className="mb-2 block text-xs font-medium text-white/55"
            >
              Verification code
            </label>

            <input
              id="parking-action-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                onOtpChange(event.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              disabled={isSending || isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-4 text-center text-2xl font-bold tracking-[0.45em] text-white outline-none transition placeholder:text-white/15 focus:border-emerald-200/40 focus:bg-white/[0.08] disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={onResend}
            disabled={isSending || isSubmitting}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-100/70 transition hover:text-emerald-100 disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Resend verification code
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending || isSubmitting}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSending || isSubmitting || otp.length !== 6}
            className={
              isDelete
                ? "inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/80 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                : "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#06544E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

            {isDelete ? "Delete parking" : "Close parking"}
          </button>
        </div>
      </div>
    </div>
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
      <AlertCircle className="h-3.5 w-3.5" />
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
              className="h-[700px] rounded-[1.75rem] bg-white/10"
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
