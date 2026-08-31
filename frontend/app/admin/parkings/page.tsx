"use client";

import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  approveAdminParking,
  getAdminParkings,
  rejectAdminParking,
  type AdminParking,
} from "@/services/admin.service";

import { getApiErrorMessage } from "@/lib/api-error";

export default function AdminParkingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminParkings />
    </ProtectedRoute>
  );
}

function AdminParkings() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedParking, setSelectedParking] = useState<AdminParking | null>(
    null,
  );

  const parkingsQuery = useQuery({
    queryKey: ["admin", "parkings"],
    queryFn: getAdminParkings,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const approveMutation = useMutation({
    mutationFn: (parkingId: string) => approveAdminParking(parkingId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "parkings"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });

      setSelectedParking(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (parkingId: string) => rejectAdminParking(parkingId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "parkings"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });

      setSelectedParking(null);
    },
  });

  const parkings = parkingsQuery.data ?? [];

  const filteredParkings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return parkings.filter((parking) => {
      const matchesStatus =
        statusFilter === "all" || parking.status === statusFilter;

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const ownerName = getOwnerName(parking).toLowerCase();

      const matchesSearch =
        parking.parkingName?.toLowerCase().includes(normalizedSearch) ||
        parking.city?.toLowerCase().includes(normalizedSearch) ||
        parking.state?.toLowerCase().includes(normalizedSearch) ||
        parking.address?.toLowerCase().includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [parkings, search, statusFilter]);

  const total = parkings.length;

  const pending = parkings.filter(
    (parking) => parking.status === "pending",
  ).length;

  const approved = parkings.filter(
    (parking) => parking.status === "approved",
  ).length;

  const rejected = parkings.filter(
    (parking) => parking.status === "rejected",
  ).length;

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  if (parkingsQuery.isLoading) {
    return <PageLoading />;
  }

  if (parkingsQuery.isError) {
    return (
      <main className="min-h-screen bg-[#06544E] px-4 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-300/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
          <XCircle className="mx-auto h-12 w-12 text-red-300" />

          <h1 className="mt-5 text-2xl font-bold">Unable to load parkings</h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {getApiErrorMessage(parkingsQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => void parkingsQuery.refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E] transition hover:bg-white/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
      {/* ==========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.025) 75%, transparent 75%)",
            backgroundSize: "90px 90px",
          }}
        />

        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[150px]" />
      </div>
     <AdminNavbar/>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-6">

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#06544E] shadow-xl">
                <CarFront className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-emerald-100/50">Administration</p>

                <h1 className="mt-0.5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Parking Management
                </h1>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => void parkingsQuery.refetch()}
            disabled={parkingsQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                parkingsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </header>

        {/* ========================================================
            SUMMARY
        ======================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="All Parkings" value={total} icon={CarFront} />

          <SummaryCard label="Pending" value={pending} icon={Clock3} />

          <SummaryCard label="Approved" value={approved} icon={CheckCircle2} />

          <SummaryCard label="Rejected" value={rejected} icon={XCircle} />
        </section>

        {/* ========================================================
            FILTERS
        ======================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search parking, city, address or owner..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-200/30"
              />
            </div>

            {/* STATUS */}

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={statusFilter === "pending"}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </FilterButton>

              <FilterButton
                active={statusFilter === "approved"}
                onClick={() => setStatusFilter("approved")}
              >
                Approved
              </FilterButton>

              <FilterButton
                active={statusFilter === "rejected"}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected
              </FilterButton>
            </div>
          </div>
        </section>

        {/* ========================================================
            RESULTS
        ======================================================== */}

        <section className="mt-6">
          {filteredParkings.length === 0 ? (
            <EmptyState search={search} statusFilter={statusFilter} />
          ) : (
            <div className="grid gap-5">
              {filteredParkings.map((parking) => (
                <ParkingCard
                  key={getParkingId(parking)}
                  parking={parking}
                  onView={() => setSelectedParking(parking)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ==========================================================
          DETAIL MODAL
      ========================================================== */}

      {selectedParking && (
        <ParkingDetailModal
          parking={selectedParking}
          onClose={() => setSelectedParking(null)}
          onApprove={() =>
            approveMutation.mutate(getParkingId(selectedParking))
          }
          onReject={() => rejectMutation.mutate(getParkingId(selectedParking))}
          isProcessing={isProcessing}
        />
      )}

      {(approveMutation.isError || rejectMutation.isError) && (
  <div className="fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-red-300/20 bg-[#073f3a] p-4 shadow-2xl">
    <div className="flex gap-3">
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

      <div>
        <p className="text-sm font-semibold">Action failed</p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {getApiErrorMessage(
            approveMutation.error || rejectMutation.error,
          )}
        </p>
      </div>
    </div>
  </div>
)}

{/* ADMIN FOOTER */}
<AdminFooter />
</main>
  );
}

function ParkingCard({
  parking,
  onView,
}: {
  parking: AdminParking;
  onView: () => void;
}) {
  const status = normalizeStatus(parking.status);

  const image = parking.images?.[0]?.url ?? null;

  const ownerName = getOwnerName(parking);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl transition hover:border-white/15">
      <div className="flex flex-col lg:flex-row">
        {/* IMAGE */}

        <div className="relative h-52 w-full shrink-0 overflow-hidden bg-black/20 sm:h-64 lg:h-auto lg:w-72">
          {image ? (
            <Image
              src={image}
              alt={parking.parkingName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center">
              <CarFront className="h-12 w-12 text-white/10" />
            </div>
          )}

          <div className="absolute left-4 top-4">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold">
                  {parking.parkingName}
                </h2>

                {parking.isActive === false && (
                  <span className="rounded-full border border-red-300/10 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold uppercase text-red-100">
                    Inactive
                  </span>
                )}
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/40">
                <MapPin className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  {parking.city}, {parking.state}
                </span>
              </p>
            </div>

            <p className="shrink-0 rounded-lg bg-white/[0.05] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              {formatParkingType(parking.parkingType)}
            </p>
          </div>

          {/* DETAILS */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Owner" value={ownerName} icon={Users} />

            <InfoItem
              label="Area"
              value={`${parking.parkingArea ?? 0} sq ft`}
              icon={MapPin}
            />

            <InfoItem
              label="Vehicles"
              value={formatVehicleTypes(parking.supportedVehicleTypes)}
              icon={CarFront}
            />

            <InfoItem
              label="Bookings"
              value={formatBookingModes(parking.bookingModes)}
              icon={Clock3}
            />
          </div>

          {/* FOOTER */}

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-white/25">Address</p>

              <p className="mt-1 max-w-xl truncate text-sm text-white/50">
                {parking.address}
              </p>
            </div>

            <button
              type="button"
              onClick={onView}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              View details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ParkingDetailModal({
  parking,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: {
  parking: AdminParking;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const status = normalizeStatus(parking.status);

  const image = parking.images?.[0]?.url ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#064b46] shadow-2xl">
        {/* IMAGE */}

        <div className="relative h-56 overflow-hidden sm:h-72">
          {image ? (
            <Image
              src={image}
              alt={parking.parkingName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/20">
              <CarFront className="h-16 w-16 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#064b46] via-transparent to-black/10" />

          <div className="absolute left-5 top-5">
            <StatusBadge status={status} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition hover:bg-black/50 hover:text-white"
            aria-label="Close"
          >
            <XCircle className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {parking.parkingName}
            </h2>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <MapPin className="h-4 w-4" />
              {parking.city}, {parking.state}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {/* BASIC INFO */}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Owner" value={getOwnerName(parking)} />

            <DetailItem
              label="Contact"
              value={parking.contactNumber || "Not provided"}
            />

            <DetailItem
              label="Parking type"
              value={formatParkingType(parking.parkingType)}
            />

            <DetailItem
              label="Area"
              value={`${parking.parkingArea ?? 0} sq ft`}
            />

            <DetailItem
              label="Vehicles"
              value={formatVehicleTypes(parking.supportedVehicleTypes)}
            />

            <DetailItem
              label="Booking modes"
              value={formatBookingModes(parking.bookingModes)}
            />
          </div>

          {/* ADDRESS */}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs uppercase tracking-wider text-white/30">
              Address
            </p>

            <p className="mt-2 text-sm leading-6 text-white/70">
              {parking.address}
            </p>

            {parking.landmark && (
              <p className="mt-2 text-xs text-white/35">
                Landmark: {parking.landmark}
              </p>
            )}

            <p className="mt-2 text-xs text-white/35">
              {parking.city}, {parking.state} - {parking.pincode}
            </p>
          </div>

          {/* DESCRIPTION */}

          {parking.description && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-white/30">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-white/55">
                {parking.description}
              </p>
            </div>
          )}

          {/* FACILITIES */}

          {parking.facilities && parking.facilities.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-white/30">
                Facilities
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {parking.facilities.map((facility, index) => (
                  <span
                    key={`${facility}-${index}`}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60"
                  >
                    {formatLabel(facility)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PRICING */}

          {parking.pricing && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-white/30">
                Pricing
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PricingCard
                  title="Two Wheeler"
                  pricing={parking.pricing.twoWheeler}
                />

                <PricingCard
                  title="Four Wheeler"
                  pricing={parking.pricing.fourWheeler}
                />

                <PricingCard
                  title="Van / Minibus"
                  pricing={parking.pricing.vanMinibus}
                />

                <PricingCard
                  title="Heavy Vehicle"
                  pricing={parking.pricing.heavyVehicle}
                />
              </div>
            </div>
          )}

          {/* ACTIONS */}

          {status === "pending" && (
            <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onReject}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/15 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject parking
              </button>

              <button
                type="button"
                onClick={onApprove}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve parking
              </button>
            </div>
          )}

          {status === "approved" && (
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.05] p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-200" />

              <div>
                <p className="text-sm font-semibold">Parking approved</p>

                <p className="mt-1 text-xs text-white/35">
                  This parking is currently approved.
                </p>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-red-300/10 bg-red-400/[0.05] p-4">
              <XCircle className="h-5 w-5 text-red-200" />

              <div>
                <p className="text-sm font-semibold">Parking rejected</p>

                <p className="mt-1 text-xs text-white/35">
                  This parking has been rejected.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PRICING
|--------------------------------------------------------------------------
*/

function PricingCard({
  title,
  pricing,
}: {
  title: string;
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-sm font-semibold">{title}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <PriceItem label="Hourly" value={pricing?.hourly} />

        <PriceItem label="Daily" value={pricing?.daily} />

        <PriceItem label="Monthly" value={pricing?.monthly} />
      </div>
    </div>
  );
}

function PriceItem({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-white/25">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-white/65">
        {typeof value === "number" ? formatCurrency(value) : "—"}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>
      </div>

      <p className="mt-5 text-sm text-white/40">{label}</p>

      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/25" />

        <span className="text-[10px] uppercase tracking-wider text-white/25">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-xs font-semibold text-white/65">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL ITEM
|--------------------------------------------------------------------------
*/

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-white/70">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FILTER BUTTON
|--------------------------------------------------------------------------
*/

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
        active
          ? "bg-white text-[#06544E]"
          : "border border-white/10 bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }: { status: ParkingStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-md">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-400/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-100 backdrop-blur-md">
        <XCircle className="h-3 w-3" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md">
      <Clock3 className="h-3 w-3" />
      Pending
    </span>
  );
}


function EmptyState({
  search,
  statusFilter,
}: {
  search: string;
  statusFilter: StatusFilter;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-12 text-center backdrop-blur-xl">
      <CarFront className="mx-auto h-12 w-12 text-white/10" />

      <h2 className="mt-5 text-xl font-semibold">No parkings found</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {search || statusFilter !== "all"
          ? "Try changing your search or status filter."
          : "There are no parking locations available yet."}
      </p>
    </div>
  );
}


function PageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06544E] text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" />

        <p className="mt-4 text-sm text-white/40">Loading parkings...</p>
      </div>
    </main>
  );
}

type ParkingStatus = "pending" | "approved" | "rejected";

type StatusFilter = "all" | ParkingStatus;

function getParkingId(parking: AdminParking): string {
  const candidate =
    (
      parking as AdminParking & {
        _id?: string;
        id?: string;
      }
    )._id ||
    (
      parking as AdminParking & {
        id?: string;
      }
    ).id;

  return String(candidate ?? "");
}

function getOwnerName(parking: AdminParking): string {
  const owner = parking.ownerId;

  if (typeof owner === "object" && owner !== null) {
    const ownerObject = owner as {
      name?: {
        first?: string;
        last?: string;
      };
      firstName?: string;
      lastName?: string;
      nameString?: string;
    };

    if (ownerObject.nameString) {
      return ownerObject.nameString;
    }

    if (ownerObject.name) {
      const fullName =
        `${ownerObject.name.first ?? ""} ${ownerObject.name.last ?? ""}`.trim();

      if (fullName) {
        return fullName;
      }
    }

    const fullName =
      `${ownerObject.firstName ?? ""} ${ownerObject.lastName ?? ""}`.trim();

    if (fullName) {
      return fullName;
    }
  }

  return "Parking owner";
}

function normalizeStatus(status?: string): ParkingStatus {
  if (status === "approved") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "pending";
}

function formatParkingType(value?: string): string {
  if (!value) {
    return "Not specified";
  }

  return formatLabel(value);
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatVehicleTypes(values?: string[]): string {
  if (!values || values.length === 0) {
    return "None configured";
  }

  return values.map(formatLabel).join(", ");
}

function formatBookingModes(modes?: {
  hourly?: boolean;
  daily?: boolean;
  monthly?: boolean;
}): string {
  if (!modes) {
    return "None";
  }

  const enabled: string[] = [];

  if (modes.hourly) {
    enabled.push("Hourly");
  }

  if (modes.daily) {
    enabled.push("Daily");
  }

  if (modes.monthly) {
    enabled.push("Monthly");
  }

  return enabled.length > 0 ? enabled.join(", ") : "None";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
