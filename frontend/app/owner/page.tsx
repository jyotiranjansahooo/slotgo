"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OwnerNavbar from "@/components/owner/OwnerNavbar";

import { getParkings } from "@/services/parking.service";
import { getParkingSlots } from "@/services/parkingSlot.service";

import type { Parking } from "@/types/parking";
import type { ParkingSlot } from "@/types/parkingSlot";

import { getApiErrorMessage } from "@/lib/api-error";

import {
  AlertCircle,
  ArrowRight,
  Bike,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  CircleParking,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  ParkingSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
  UserRound,
  Wallet,
  Warehouse,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface ParkingWithSlots {
  parking: Parking;
  slots: ParkingSlot[];
  loadingSlots: boolean;
  slotsError: string | null;
}

type LucideIcon = ComponentType<{
  className?: string;
}>;

/* ============================================================
   PAGE
============================================================ */

export default function OwnerPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerDashboard />
    </ProtectedRoute>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function OwnerDashboard() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [parkingSlots, setParkingSlots] = useState<
    Record<string, ParkingSlot[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ==========================================================
     FETCH DASHBOARD
  ========================================================== */

  async function loadDashboard(showRefreshLoader = false) {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const parkingData = await getParkings();

      setParkings(parkingData);

      const slotResults = await Promise.all(
        parkingData.map(async (parking) => {
          try {
            const slots = await getParkingSlots(parking._id);

            return {
              parkingId: parking._id,
              slots,
            };
          } catch (slotError) {
            console.error(
              `Failed to load slots for parking ${parking._id}:`,
              slotError,
            );

            return {
              parkingId: parking._id,
              slots: [],
            };
          }
        }),
      );

      const slotMap: Record<string, ParkingSlot[]> = {};

      for (const result of slotResults) {
        slotMap[result.parkingId] = result.slots;
      }

      setParkingSlots(slotMap);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);

      setError(message || "Unable to load your parkings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const parkingData = await getParkings();

        if (cancelled) {
          return;
        }

        setParkings(parkingData);

        const slotResults = await Promise.all(
          parkingData.map(async (parking) => {
            try {
              const slots = await getParkingSlots(parking._id);

              return {
                parkingId: parking._id,
                slots,
              };
            } catch (slotError) {
              console.error(
                `Failed to load slots for parking ${parking._id}:`,
                slotError,
              );

              return {
                parkingId: parking._id,
                slots: [],
              };
            }
          }),
        );

        if (cancelled) {
          return;
        }

        const slotMap: Record<string, ParkingSlot[]> = {};

        for (const result of slotResults) {
          slotMap[result.parkingId] = result.slots;
        }

        setParkingSlots(slotMap);
        setError(null);
        setLoading(false);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        const message = getApiErrorMessage(requestError);

        setError(message || "Unable to load your parkings.");
        setLoading(false);
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      setError(null);

      const parkingData = await getParkings();

      setParkings(parkingData);

      const slotResults = await Promise.all(
        parkingData.map(async (parking) => {
          try {
            const slots = await getParkingSlots(parking._id);

            return {
              parkingId: parking._id,
              slots,
            };
          } catch (slotError) {
            console.error(
              `Failed to load slots for parking ${parking._id}:`,
              slotError,
            );

            return {
              parkingId: parking._id,
              slots: [],
            };
          }
        }),
      );

      const slotMap: Record<string, ParkingSlot[]> = {};

      for (const result of slotResults) {
        slotMap[result.parkingId] = result.slots;
      }

      setParkingSlots(slotMap);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);

      setError(message || "Unable to load your parkings.");
    } finally {
      setRefreshing(false);
    }
  }
  const statistics = useMemo(() => {
    const totalParkings = parkings.length;

    const activeParkings = parkings.filter(
      (parking) => parking.isActive,
    ).length;

    const pendingParkings = parkings.filter(
      (parking) => parking.status === "pending",
    ).length;

    const approvedParkings = parkings.filter(
      (parking) => parking.status === "approved",
    ).length;

    const totalSlots = Object.values(parkingSlots).reduce(
      (total, slots) => total + slots.length,
      0,
    );

    const availableSlots = Object.values(parkingSlots).reduce(
      (total, slots) =>
        total + slots.filter((slot) => slot.status === "available").length,
      0,
    );

    const occupiedSlots = Object.values(parkingSlots).reduce(
      (total, slots) =>
        total + slots.filter((slot) => slot.status === "occupied").length,
      0,
    );

    const reservedSlots = Object.values(parkingSlots).reduce(
      (total, slots) =>
        total + slots.filter((slot) => slot.status === "reserved").length,
      0,
    );

    const maintenanceSlots = Object.values(parkingSlots).reduce(
      (total, slots) =>
        total + slots.filter((slot) => slot.status === "maintenance").length,
      0,
    );

    return {
      totalParkings,
      activeParkings,
      pendingParkings,
      approvedParkings,
      totalSlots,
      availableSlots,
      occupiedSlots,
      reservedSlots,
      maintenanceSlots,
    };
  }, [parkings, parkingSlots]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.025) 75%, transparent 75%)",
            backgroundSize: "90px 90px",
          }}
        />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />

        <div className="absolute right-0 top-[40%] h-[400px] w-[400px] rounded-full bg-teal-300/5 blur-[120px]" />
      </div>

      <OwnerNavbar />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <DashboardHeader onRefresh={refreshDashboard} refreshing={refreshing} />

        {error && (
          <ErrorBanner message={error} onRetry={() => loadDashboard(true)} />
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="mt-8">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/45">
                  Overview
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Your parking network
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                  icon={Building2}
                  label="Total Parkings"
                  value={statistics.totalParkings}
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Active"
                  value={statistics.activeParkings}
                />

                <StatCard
                  icon={CircleParking}
                  label="Total Slots"
                  value={statistics.totalSlots}
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Available"
                  value={statistics.availableSlots}
                />

                <StatCard
                  icon={Car}
                  label="Occupied"
                  value={statistics.occupiedSlots}
                />

                <StatCard
                  icon={Warehouse}
                  label="Reserved"
                  value={statistics.reservedSlots}
                />
              </div>
            </section>

            {/* ==================================================
                SLOT SUMMARY
            ================================================== */}

            <section className="mt-6">
              <SlotSummary
                total={statistics.totalSlots}
                available={statistics.availableSlots}
                occupied={statistics.occupiedSlots}
                reserved={statistics.reservedSlots}
                maintenance={statistics.maintenanceSlots}
              />
            </section>

            {/* ==================================================
                PARKINGS
            ================================================== */}

            <section className="mt-10">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/45">
                    Locations
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Your parking locations
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    View parking information and manage individual slots.
                  </p>
                </div>

                <Link
                  href="/owner/parkings/add"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E] shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  <Plus className="h-4 w-4" />
                  Add parking
                </Link>
              </div>

              {parkings.length === 0 ? (
                <EmptyParking />
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {parkings.map((parking) => (
                    <ParkingDashboardCard
                      key={parking._id}
                      parking={parking}
                      slots={parkingSlots[parking._id] ?? []}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <section className="mt-10">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/45">
                  Quick access
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Manage your business
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DashboardCard
                  href="/owner/parkings"
                  icon={Car}
                  title="My Parkings"
                  description="Manage parking locations, information and availability."
                />

                <DashboardCard
                  href="/owner/bookings"
                  icon={CalendarDays}
                  title="Bookings"
                  description="View and manage bookings from drivers."
                />

                <DashboardCard
                  href="/owner/wallet"
                  icon={Wallet}
                  title="Wallet"
                  description="View your earnings and transactions."
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   HEADER
============================================================ */

function DashboardHeader({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-200/60">Parking Owner</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Owner Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Monitor your parking locations, slot availability and business
          activity from one place.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />

        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </header>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/10 bg-emerald-300/10">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
          SlotGo
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-white/45">{label}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/* ============================================================
   SLOT SUMMARY
============================================================ */

function SlotSummary({
  total,
  available,
  occupied,
  reserved,
  maintenance,
}: {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}) {
  const availablePercentage =
    total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/10 p-5 shadow-xl backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/10">
              <ParkingSquare className="h-5 w-5 text-emerald-100" />
            </div>

            <div>
              <p className="text-sm font-semibold">Slot availability</p>

              <p className="text-xs text-white/35">
                Current status across all your parking locations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SlotStatus
            label="Available"
            value={available}
            className="text-emerald-200"
          />

          <SlotStatus
            label="Occupied"
            value={occupied}
            className="text-red-200"
          />

          <SlotStatus
            label="Reserved"
            value={reserved}
            className="text-amber-200"
          />

          <SlotStatus
            label="Maintenance"
            value={maintenance}
            className="text-orange-200"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-white/40">Available capacity</span>

          <span className="font-semibold text-white/70">
            {availablePercentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-500"
            style={{
              width: `${availablePercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SLOT STATUS
============================================================ */

function SlotStatus({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
      <p className={`text-lg font-bold ${className}`}>{value}</p>

      <p className="mt-0.5 text-[10px] text-white/35">{label}</p>
    </div>
  );
}

/* ============================================================
   PARKING DASHBOARD CARD
============================================================ */

function ParkingDashboardCard({
  parking,
  slots,
}: {
  parking: Parking;
  slots: ParkingSlot[];
}) {
  const available = slots.filter((slot) => slot.status === "available").length;

  const occupied = slots.filter((slot) => slot.status === "occupied").length;

  const reserved = slots.filter((slot) => slot.status === "reserved").length;

  const maintenance = slots.filter(
    (slot) => slot.status === "maintenance",
  ).length;

  const totalSlots = slots.length;

  const bookingModes = [];

  if (parking.bookingModes?.hourly) {
    bookingModes.push("Hourly");
  }

  if (parking.bookingModes?.daily) {
    bookingModes.push("Daily");
  }

  if (parking.bookingModes?.monthly) {
    bookingModes.push("Monthly");
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-black/10 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05]">
      {/* ======================================================
          CARD HEADER
      ====================================================== */}

      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10">
              <Building2 className="h-6 w-6 text-emerald-100" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold">
                {parking.parkingName}
              </h3>

              <p className="mt-1 text-xs capitalize text-white/35">
                {formatParkingType(parking.parkingType)}
              </p>
            </div>
          </div>

          <ParkingStatus status={parking.status} />
        </div>

        {/* Address */}

        <div className="mt-5 flex items-start gap-2 text-sm text-white/45">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200/50" />

          <p className="leading-5">
            {parking.address}
            {parking.landmark ? `, ${parking.landmark}` : ""}
            {parking.city ? `, ${parking.city}` : ""}
            {parking.state ? `, ${parking.state}` : ""}
            {parking.pincode ? ` - ${parking.pincode}` : ""}
          </p>
        </div>
      </div>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          <MiniDetail
            icon={Warehouse}
            label="Area"
            value={`${formatNumber(parking.parkingArea)} sq ft`}
          />

          <MiniDetail
            icon={Clock3}
            label="Hours"
            value={`${parking.operatingHours?.open ?? "--"} - ${
              parking.operatingHours?.close ?? "--"
            }`}
          />

          <MiniDetail
            icon={Star}
            label="Rating"
            value={
              parking.averageRating !== undefined
                ? `${Number(parking.averageRating).toFixed(1)} / 5`
                : "No rating"
            }
          />

          <MiniDetail
            icon={UserRound}
            label="Reviews"
            value={String(parking.totalReviews ?? 0)}
          />
        </div>

        {/* ====================================================
            VEHICLES
        ==================================================== */}

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
            Supported vehicles
          </p>

          <div className="flex flex-wrap gap-2">
            {(parking.supportedVehicleTypes ?? []).length === 0 ? (
              <span className="text-xs text-white/30">
                No vehicle types configured
              </span>
            ) : (
              parking.supportedVehicleTypes.map((vehicleType) => (
                <VehicleBadge key={vehicleType} vehicleType={vehicleType} />
              ))
            )}
          </div>
        </div>

        {/* ====================================================
            BOOKING MODES
        ==================================================== */}

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
            Booking modes
          </p>

          <div className="flex flex-wrap gap-2">
            {bookingModes.length === 0 ? (
              <span className="text-xs text-white/30">
                No booking modes configured
              </span>
            ) : (
              bookingModes.map((mode) => (
                <span
                  key={mode}
                  className="rounded-lg border border-emerald-300/10 bg-emerald-300/5 px-2.5 py-1.5 text-[11px] font-medium text-emerald-100/70"
                >
                  {mode}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ====================================================
            SLOTS
        ==================================================== */}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleParking className="h-4 w-4 text-white/50" />

              <span className="text-sm font-semibold">Parking slots</span>
            </div>

            <span className="text-xs font-semibold text-white/35">
              {totalSlots} total
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <SlotMiniStat
              label="Free"
              value={available}
              className="text-emerald-200"
            />

            <SlotMiniStat
              label="Busy"
              value={occupied}
              className="text-red-200"
            />

            <SlotMiniStat
              label="Reserved"
              value={reserved}
              className="text-amber-200"
            />

            <SlotMiniStat
              label="Service"
              value={maintenance}
              className="text-orange-200"
            />
          </div>
        </div>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href={`/owner/parkings/${parking._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
          >
            View parking
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href={`/owner/parkings/${parking._id}/slots`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#06544E] transition hover:bg-white/90"
          >
            Manage slots
            <CircleParking className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   PARKING STATUS
============================================================ */

function ParkingStatus({ status }: { status: string }) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    approved: {
      label: "Approved",
      className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    },

    pending: {
      label: "Pending",
      className: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    },

    rejected: {
      label: "Rejected",
      className: "border-red-300/20 bg-red-300/10 text-red-200",
    },
  };

  const current = config[status] ?? {
    label: status || "Unknown",
    className: "border-white/10 bg-white/5 text-white/50",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* ============================================================
   VEHICLE BADGE
============================================================ */

function VehicleBadge({ vehicleType }: { vehicleType: string }) {
  const config: Record<
    string,
    {
      label: string;
      icon: LucideIcon;
    }
  > = {
    twoWheeler: {
      label: "Two Wheeler",
      icon: Bike,
    },

    fourWheeler: {
      label: "Four Wheeler",
      icon: Car,
    },

    vanMinibus: {
      label: "Van / Minibus",
      icon: Truck,
    },

    heavyVehicle: {
      label: "Heavy Vehicle",
      icon: Truck,
    },
  };

  const current = config[vehicleType];

  const Icon = current?.icon ?? Car;

  const label =
    current?.label ??
    vehicleType
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-white/55">
      <Icon className="h-3.5 w-3.5" />

      {label}
    </span>
  );
}

/* ============================================================
   MINI DETAIL
============================================================ */

function MiniDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-white/30" />

        <span className="text-[10px] font-medium text-white/30">{label}</span>
      </div>

      <p className="mt-2 truncate text-xs font-semibold text-white/70">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   SLOT MINI STAT
============================================================ */

function SlotMiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${className}`}>{value}</p>

      <p className="mt-0.5 text-[9px] text-white/30">{label}</p>
    </div>
  );
}

/* ============================================================
   QUICK DASHBOARD CARD
============================================================ */

function DashboardCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-200/20 hover:bg-white/[0.07]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/[0.06] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/10 bg-emerald-300/10">
            <Icon className="h-5 w-5 text-emerald-100" />
          </div>

          <ChevronRight className="h-5 w-5 text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-200" />
        </div>

        <h2 className="mt-6 text-lg font-semibold">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-white/40">{description}</p>
      </div>
    </Link>
  );
}

/* ============================================================
   EMPTY PARKING
============================================================ */

function EmptyParking() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-black/10 px-6 py-16 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
        <ParkingSquare className="h-8 w-8 text-white/30" />
      </div>

      <h3 className="mt-5 text-lg font-bold">No parking locations yet</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        Add your first parking location to start managing parking slots, vehicle
        types, pricing and bookings.
      </p>

      <Link
        href="/owner/parkings/add"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E] transition hover:bg-white/90"
      >
        <Plus className="h-4 w-4" />
        Add your first parking
      </Link>
    </div>
  );
}

/* ============================================================
   ERROR BANNER
============================================================ */

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-300/15 bg-red-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
          <AlertCircle className="h-5 w-5 text-red-200" />
        </div>

        <div>
          <p className="text-sm font-semibold text-red-100">
            Unable to load your parkings
          </p>

          <p className="mt-1 text-xs text-red-100/50">{message}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200/10 bg-red-400/5 px-4 py-2.5 text-xs font-semibold text-red-100 transition hover:bg-red-400/10"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function DashboardSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-8">
      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>

      {/* Slot summary */}

      <div className="h-40 rounded-3xl border border-white/10 bg-white/[0.04]" />

      {/* Parking cards */}

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-[520px] rounded-3xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatParkingType(value: string) {
  const labels: Record<string, string> = {
    open: "Open Parking",
    covered: "Covered Parking",
    basement: "Basement Parking",
    multiLevel: "Multi Level Parking",
    street: "Street Parking",
  };

  return labels[value] ?? value;
}

function formatNumber(value: number | undefined) {
  if (value === undefined || value === null) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(value);
}
