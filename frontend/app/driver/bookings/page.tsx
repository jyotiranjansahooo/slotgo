"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  ParkingSquare,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getMyBookings } from "@/services/booking.service";
import { getApiErrorMessage } from "@/lib/api-error";

import type { Booking } from "@/types/booking";

export default function DriverBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <MyBookings />
    </ProtectedRoute>
  );
}

function MyBookings() {
  const router = useRouter();

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
    staleTime: 30 * 1000,
  });

  if (bookingsQuery.isLoading) {
    return <BookingsLoading />;
  }

  if (bookingsQuery.isError) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#1a1571] text-white">
        <BackgroundPattern />

        <div className="relative z-10">
          <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 pb-10 pt-32 sm:px-6 lg:px-8">
            <div className="w-full rounded-[28px] border border-white/20 bg-white p-6 text-zinc-950 shadow-2xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <X className="h-7 w-7" />
              </div>

              <h1 className="mt-6 text-2xl font-black sm:text-3xl">
                Unable to load your bookings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                {getApiErrorMessage(bookingsQuery.error)}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void bookingsQuery.refetch()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4338ff] px-6 text-sm font-bold text-white transition hover:bg-[#3730d8] active:scale-[0.98]"
                >
                  Try Again
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const bookings: Booking[] = bookingsQuery.data?.data ?? [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a1571] text-white">
      <BackgroundPattern />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8">
          <section className="mb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  My Bookings
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/80 sm:text-base">
                  View your active, upcoming, completed, and cancelled parking
                  bookings in one place.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-7 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Total bookings"
              value={String(bookings.length)}
            />

            <SummaryCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Active / confirmed"
              value={String(
                bookings.filter(
                  (booking) =>
                    booking.bookingStatus === "active" ||
                    booking.bookingStatus === "confirmed",
                ).length,
              )}
            />

            <SummaryCard
              icon={<CreditCard className="h-5 w-5" />}
              label="Total spent"
              value={formatMoney(
                bookings.reduce(
                  (total, booking) => total + Number(booking.driverPays || 0),
                  0,
                ),
              )}
            />
          </section>

          {bookings.length === 0 ? (
            <EmptyBookings
              onFindParking={() => router.push("/driver/parkings")}
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onClick={() => router.push(`/driver/bookings/${booking._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

function BookingCard({ booking, onClick }: BookingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/20 bg-white text-zinc-950 shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-blue-950/30">
      <div className="h-1.5 bg-gradient-to-r from-[#4338ff] via-[#6366f1] to-[#22d3ee]" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
              Booking number
            </p>

            <h2 className="mt-1 truncate font-mono text-base font-black text-zinc-950 sm:text-lg">
              {booking.bookingNumber}
            </h2>
          </div>

          <StatusBadge status={booking.bookingStatus} />
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4338ff]/10 text-[#4338ff]">
              <MapPin className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Parking location
              </p>

              <p className="mt-1 truncate font-bold text-zinc-950">
                {booking.parkingSnapshot.parkingName}
              </p>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                {booking.parkingSnapshot.address}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoItem
            icon={<CarFront className="h-4 w-4" />}
            label="Vehicle"
            value={`${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.vehicleModel}`}
          />

          <InfoItem
            icon={<Clock3 className="h-4 w-4" />}
            label="Start"
            value={formatDate(booking.startTime)}
          />

          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="End"
            value={formatDate(booking.endTime)}
          />
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total
            </p>

            <p className="mt-1 text-xl font-black text-[#4338ff]">
              {formatMoney(booking.driverPays)}
            </p>

            <p className="mt-1 text-xs capitalize text-zinc-400">
              Payment: {booking.paymentStatus}
            </p>
          </div>

          <button
            type="button"
            onClick={onClick}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4338ff] px-5 text-sm font-bold text-white shadow-lg shadow-[#4338ff]/20 transition hover:bg-[#3730d8] active:scale-[0.98]"
          >
            View Booking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-blue-100/65">{label}</p>

          <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "confirmed"
        ? "bg-blue-50 text-blue-700 border-blue-100"
        : status === "completed"
          ? "bg-violet-50 text-violet-700 border-violet-100"
          : status === "cancelled"
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <span
      className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${styles}`}
    >
      {status}
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
    <div className="min-w-0 rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
      <div className="flex items-center gap-2 text-[#4338ff]">
        {icon}

        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
      </div>

      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-zinc-700">
        {value}
      </p>
    </div>
  );
}

function EmptyBookings({ onFindParking }: { onFindParking: () => void }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/20 bg-white/90 text-center text-zinc-950 shadow-2xl">
      <div className="h-1.5 bg-gradient-to-r from-[#4338ff] via-[#6366f1] to-[#22d3ee]" />

      <div className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#4338ff]/10 text-[#4338ff]">
          <ParkingSquare className="h-9 w-9" />
        </div>

        <h2 className="mt-6 text-2xl font-black sm:text-3xl">
          No bookings yet
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          You have not booked a parking space yet. Find a parking location and
          reserve your spot.
        </p>

        <button
          type="button"
          onClick={onFindParking}
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4338ff] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#3730d8] active:scale-[0.98]"
        >
          Find Parking
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #4338ff 0px,
              #4338ff 75px,
              #4f46e5 75px,
              #4f46e5 150px,
              #6366f1 150px,
              #6366f1 225px,
              #5154f4 225px,
              #5154f4 300px,
              #4338ff 300px,
              #4338ff 375px
            )
          `,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(125,211,252,0.08), rgba(26,21,113,0.75) 48%, #1a1571 100%)",
        }}
      />

      <div className="absolute inset-0 bg-[#1a1571]/35" />

      <div className="absolute -left-40 top-24 h-[500px] w-[500px] rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="absolute -right-40 top-[35%] h-[550px] w-[550px] rounded-full bg-violet-300/15 blur-3xl" />

      <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-300/10 blur-3xl" />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 74px, rgba(255,255,255,0.35) 75px, transparent 76px)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function BookingsLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a1571] text-white">
      <BackgroundPattern />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 w-60 rounded-xl bg-white/20 sm:h-14 sm:w-72" />

            <div className="mt-4 h-5 w-full max-w-xl rounded-lg bg-white/15" />

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-2xl border border-white/10 bg-white/10"
                />
              ))}
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <BookingCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white">
      <div className="h-1.5 bg-zinc-200" />

      <div className="animate-pulse p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-3 w-24 rounded bg-zinc-200" />

            <div className="mt-2 h-5 w-40 rounded bg-zinc-200" />
          </div>

          <div className="h-7 w-20 rounded-full bg-zinc-200" />
        </div>

        <div className="mt-5 rounded-2xl bg-zinc-100 p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-200" />

            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-zinc-200" />

              <div className="mt-2 h-4 w-48 rounded bg-zinc-200" />

              <div className="mt-2 h-3 w-64 max-w-full rounded bg-zinc-200" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-zinc-100 p-3">
              <div className="h-3 w-16 rounded bg-zinc-200" />

              <div className="mt-3 h-8 rounded bg-zinc-200" />
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-zinc-200 pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="h-3 w-12 rounded bg-zinc-200" />

              <div className="mt-2 h-6 w-24 rounded bg-zinc-200" />
            </div>

            <div className="h-11 w-32 rounded-xl bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
