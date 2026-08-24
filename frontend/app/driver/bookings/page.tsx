"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getMyBookings } from "@/services/booking.service";
import { getApiErrorMessage } from "@/lib/api-error";

import type { Booking } from "@/types/booking";

/* ============================================================
   PAGE
   ============================================================ */

export default function DriverBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <MyBookings />
    </ProtectedRoute>
  );
}

/* ============================================================
   MY BOOKINGS
   ============================================================ */

function MyBookings() {
  const router = useRouter();

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
    staleTime: 30 * 1000,
  });

  /* ==========================================================
     LOADING
     ========================================================== */

  if (bookingsQuery.isLoading) {
    return <BookingsLoading />;
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  if (bookingsQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.push("/driver")}
            className="mb-6 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to dashboard
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h1 className="text-xl font-bold">
              Unable to load your bookings
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {getApiErrorMessage(bookingsQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => void bookingsQuery.refetch()}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     DATA
     ========================================================== */

  const bookings: Booking[] = bookingsQuery.data?.data ?? [];

  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ====================================================
            HEADER
           ==================================================== */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/driver")}
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to dashboard
          </button>

          <div>
            <p className="text-sm text-slate-500">Driver</p>

            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              View your current and previous parking bookings.
            </p>
          </div>
        </div>

        {/* ====================================================
            EMPTY STATE
           ==================================================== */}

        {bookings.length === 0 ? (
          <EmptyBookings
            onFindParking={() => router.push("/driver/parkings")}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onClick={() =>
                  router.push(`/driver/bookings/${booking._id}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   BOOKING CARD
   ============================================================ */

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

function BookingCard({ booking, onClick }: BookingCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05] sm:p-6">
      {/* ======================================================
          TOP
         ====================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs text-slate-500">Booking number</p>

          <h2 className="mt-1 font-mono text-lg font-bold text-white">
            {booking.bookingNumber}
          </h2>
        </div>

        <StatusBadge status={booking.bookingStatus} />
      </div>

      {/* ======================================================
          PARKING
         ====================================================== */}

      <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
        <p className="text-xs text-slate-500">Parking</p>

        <p className="mt-1 font-semibold text-white">
          {booking.parkingSnapshot.parkingName}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          {booking.parkingSnapshot.address}
        </p>
      </div>

      {/* ======================================================
          INFORMATION
         ====================================================== */}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <InfoItem
          label="Vehicle"
          value={`${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.vehicleModel}`}
        />

        <InfoItem
          label="Start"
          value={formatDate(booking.startTime)}
        />

        <InfoItem
          label="End"
          value={formatDate(booking.endTime)}
        />
      </div>

      {/* ======================================================
          BOTTOM
         ====================================================== */}

      <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Total</p>

          <p className="mt-1 text-xl font-bold text-white">
            {formatMoney(booking.driverPays)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs capitalize text-slate-500">
            Payment: {booking.paymentStatus}
          </span>

          <button
            type="button"
            onClick={onClick}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            View Booking →
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "active"
      ? "bg-green-500/10 text-green-300"
      : status === "confirmed"
        ? "bg-blue-500/10 text-blue-300"
        : status === "completed"
          ? "bg-purple-500/10 text-purple-300"
          : status === "cancelled"
            ? "bg-red-500/10 text-red-300"
            : "bg-yellow-500/10 text-yellow-300";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${className}`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   INFO ITEM
   ============================================================ */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

/* ============================================================
   EMPTY BOOKINGS
   ============================================================ */

function EmptyBookings({
  onFindParking,
}: {
  onFindParking: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
        🅿️
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        No bookings yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        You have not booked a parking space yet. Find a parking
        location and reserve your spot.
      </p>

      <button
        type="button"
        onClick={onFindParking}
        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Find Parking
      </button>
    </div>
  );
}

/* ============================================================
   LOADING
   ============================================================ */

function BookingsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="animate-pulse">
          <div className="h-4 w-20 rounded bg-white/10" />

          <div className="mt-3 h-10 w-52 rounded bg-white/10" />

          <div className="mt-2 h-4 w-80 rounded bg-white/10" />

          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-6 w-48 rounded bg-white/10" />

                <div className="mt-5 h-20 rounded-xl bg-white/10" />

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="h-10 rounded bg-white/10" />
                  <div className="h-10 rounded bg-white/10" />
                  <div className="h-10 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   DATE
   ============================================================ */

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}


function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}