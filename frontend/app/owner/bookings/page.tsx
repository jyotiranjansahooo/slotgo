"use client";

import { useQuery } from "@tanstack/react-query";
import OwnerNavbar from "@/components/owner/OwnerNavbar";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getOwnerBookings } from "@/services/booking.service";
import { getApiErrorMessage } from "@/lib/api-error";

export default function OwnerBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerBookings />
    </ProtectedRoute>
  );
}

function OwnerBookings() {
  const bookingsQuery = useQuery({
    queryKey: ["owner", "bookings"],
    queryFn: getOwnerBookings,
    staleTime: 30 * 1000,
  });

  const bookings = bookingsQuery.data?.data ?? [];

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.025)_50%,rgba(255,255,255,0.025)_75%,transparent_75%)] bg-[length:90px_90px]" />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />
      </div>
<OwnerNavbar/>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
              <CalendarDays className="h-3.5 w-3.5" />
              Booking management
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Parking bookings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/60 sm:text-base">
              View bookings made at your parking locations and keep track of
              upcoming and completed parking sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => bookingsQuery.refetch()}
            disabled={bookingsQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                bookingsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}
        {!bookingsQuery.isLoading && !bookingsQuery.isError && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total bookings"
              value={bookings.length}
              icon={CalendarDays}
            />

            <StatCard
              label="Confirmed"
              value={
                bookings.filter(
                  (booking) =>
                    booking.bookingStatus.toLowerCase() === "confirmed",
                ).length
              }
              icon={CheckCircle2}
            />

            <StatCard
              label="Active"
              value={
                bookings.filter((booking) =>
                  ["checkedIn", "active"].includes(
                    booking.bookingStatus.toLowerCase(),
                  ),
                ).length
              }
              icon={Clock3}
            />

            <StatCard
              label="Cancelled"
              value={
                bookings.filter((booking) =>
                  booking.bookingStatus.toLowerCase().includes("cancel"),
                ).length
              }
              icon={XCircle}
            />
          </div>
        )}

        {/* LOADING */}
        {bookingsQuery.isLoading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <BookingSkeleton key={index} />
            ))}
          </div>
        )}

        {/* ERROR */}
        {bookingsQuery.isError && (
          <div className="mt-8 rounded-3xl border border-red-200/10 bg-red-950/20 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-300" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Unable to load bookings
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              {getApiErrorMessage(bookingsQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => bookingsQuery.refetch()}
              className="mt-5 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/15"
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!bookingsQuery.isLoading &&
          !bookingsQuery.isError &&
          bookings.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/10 p-12 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <CalendarDays className="h-6 w-6 text-emerald-100/70" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">No bookings yet</h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
                When drivers book one of your parking locations, their bookings
                will appear here.
              </p>
            </div>
          )}

        {/* BOOKINGS */}
        {!bookingsQuery.isLoading &&
          !bookingsQuery.isError &&
          bookings.length > 0 && (
            <div className="mt-8 space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur-xl transition hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/10 bg-emerald-300/10">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>

        <span className="text-3xl font-bold">{value}</span>
      </div>

      <p className="mt-4 text-sm text-white/50">{label}</p>
    </div>
  );
}

function BookingCard({
  booking,
}: {
  booking: {
    _id: string;
    bookingNumber: string;
    bookingStatus: string;
    paymentStatus: string;
    bookingMode: string;
    startTime: string;
    endTime: string;
    ownerReceives: number;
    driverPays: number;
    driverSnapshot: {
      name: string;
      phoneNumber: string;
    };
    parkingSnapshot: {
      parkingName: string;
      address: string;
    };
    vehicleSnapshot: {
      registrationNumber: string;
      brand: string;
      vehicleModel: string;
      vehicleType: string;
    };
  };
}) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-black/10 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/20 hover:bg-white/[0.07] sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">
              #{booking.bookingNumber}
            </span>

            <BookingStatus status={booking.bookingStatus} />

            <PaymentStatus status={booking.paymentStatus} />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            {booking.parkingSnapshot.parkingName}
          </h2>

          <div className="mt-2 flex items-start gap-2 text-sm text-white/45">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200/70" />

            <span>{booking.parkingSnapshot.address}</span>
          </div>

          {/* DRIVER */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoItem
              icon={User}
              label="Driver"
              value={booking.driverSnapshot.name}
            />

            <InfoItem
              icon={CarFront}
              label="Vehicle"
              value={`${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.vehicleModel}`}
              secondary={booking.vehicleSnapshot.registrationNumber}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="shrink-0 lg:min-w-[260px] lg:border-l lg:border-white/10 lg:pl-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40">Start</p>
              <p className="mt-1 text-sm font-medium">
                {formatDate(booking.startTime)}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">End</p>
              <p className="mt-1 text-sm font-medium">
                {formatDate(booking.endTime)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-white/40">Owner receives</p>

              <p className="mt-1 text-xl font-bold text-emerald-100">
                ₹{booking.ownerReceives.toFixed(2)}
              </p>
            </div>

            <span className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs capitalize text-white/50">
              {booking.bookingMode}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
  secondary,
}: {
  icon: typeof User;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10">
        <Icon className="h-4 w-4 text-emerald-100/70" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-white/35">{label}</p>

        <p className="truncate text-sm font-medium text-white/80">{value}</p>

        {secondary && (
          <p className="mt-0.5 truncate text-xs text-white/35">{secondary}</p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function BookingStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const isPositive =
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "checkedin" ||
    normalized === "active";

  const isCancelled = normalized.includes("cancel");

  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        isPositive
          ? "border-emerald-200/15 bg-emerald-300/10 text-emerald-100"
          : isCancelled
            ? "border-red-200/10 bg-red-400/10 text-red-200"
            : "border-amber-200/10 bg-amber-300/10 text-amber-100",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        normalized === "paid"
          ? "border-emerald-200/15 bg-emerald-300/10 text-emerald-100"
          : "border-white/10 bg-white/5 text-white/45",
      ].join(" ")}
    >
      Payment: {status}
    </span>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function BookingSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-black/10 p-6">
      <div className="h-5 w-40 rounded bg-white/10" />

      <div className="mt-5 h-5 w-64 rounded bg-white/10" />

      <div className="mt-3 h-4 w-80 rounded bg-white/5" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-16 rounded-xl bg-white/5" />
        <div className="h-16 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
