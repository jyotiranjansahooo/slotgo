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
  Menu,
  ParkingSquare,
  X,
} from "lucide-react";
import { useState } from "react";
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
      <main className="relative min-h-screen overflow-hidden bg-[#4338ff] text-white">
        <BackgroundPattern />

        <div className="relative z-10">
          <DriverNavbar />

          <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4338ff] px-6 text-sm font-bold text-white transition hover:bg-[#3730d8]"
                >
                  Try Again
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/driver")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
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
    <main className="relative min-h-screen overflow-hidden bg-[#1a1571] text-white/80">
      <BackgroundPattern />

      <div className="relative z-10">
        <DriverNavbar />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <section className="mb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
               

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
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

function DriverNavbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-[#4338ff]/35 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}

        <button
          type="button"
          onClick={() => navigate("/driver")}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#4338ff] shadow-lg">
            <ParkingSquare className="h-5 w-5" />
          </div>

          <span className="text-xl font-black tracking-tight text-white/90">
            SlotGo
          </span>
        </button>

        {/* DESKTOP NAV */}

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => navigate("/driver")}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/driver/parkings")}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Find Parking
          </button>

          <button
            type="button"
            onClick={() => navigate("/driver/bookings")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#4338ff] shadow-lg"
          >
            My Bookings
          </button>
        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#393dd8]/95 px-4 py-4 backdrop-blur-2xl sm:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <MobileNavButton
              label="Dashboard"
              onClick={() => navigate("/driver")}
            />

            <MobileNavButton
              label="Find Parking"
              onClick={() => navigate("/driver/parkings")}
            />

            <MobileNavButton
              active
              label="My Bookings"
              onClick={() => navigate("/driver/bookings")}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileNavButton({
  label,
  onClick,
  active = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-12 items-center rounded-xl px-4 text-left text-sm font-semibold transition",
        active
          ? "bg-white text-[#4338ff]"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

/* ============================================================
   SUMMARY CARD
   ============================================================ */

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

/* ============================================================
   BOOKING CARD
   ============================================================ */

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

function BookingCard({ booking, onClick }: BookingCardProps) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/20 bg-white text-zinc-950 shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-blue-950/30">
      {/* TOP STRIPE */}

      <div className="h-1.5 bg-gradient-to-r from-[#4338ff] via-[#6366f1] to-[#22d3ee]" />

      <div className="p-5 sm:p-6">
        {/* HEADER */}

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

        {/* PARKING */}

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

        {/* INFORMATION */}

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

        {/* BOTTOM */}

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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4338ff] px-5 text-sm font-bold text-white shadow-lg shadow-[#4338ff]/20 transition hover:bg-[#3730d8]"
          >
            View Booking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   STATUS
   ============================================================ */

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

/* ============================================================
   INFO ITEM
   ============================================================ */

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
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4338ff] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#3730d8]"
        >
          Find Parking
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BACKGROUND
   ============================================================ */

function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* MULTI-COLOR STRIPES */}

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

      {/* TOP LIGHT */}

      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(125,211,252,0.24), transparent 38%, rgba(59,130,246,0.12))",
        }}
      />

      {/* GLOW */}

      <div className="absolute -left-40 top-24 h-[500px] w-[500px] rounded-full bg-cyan-300/15 blur-3xl" />

      <div className="absolute -right-40 top-[35%] h-[550px] w-[550px] rounded-full bg-violet-300/20 blur-3xl" />

      <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-300/15 blur-3xl" />

      {/* THIN STRIPE LINES */}

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 74px, rgba(255,255,255,0.35) 75px, transparent 76px)",
        }}
      />

      {/* SOFT GRID */}

      <div
        className="absolute inset-0 opacity-[0.06]"
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
    <main className="relative min-h-screen overflow-hidden bg-[#4338ff] text-white">
      <BackgroundPattern />

      <div className="relative z-10">
        <SkeletonNavbar />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {/* HEADER */}

          <div className="animate-pulse">
            <div className="h-9 w-36 rounded-xl bg-white/20" />

            <div className="mt-6 h-12 w-60 rounded-xl bg-white/20 sm:h-14 sm:w-72" />

            <div className="mt-4 h-5 w-full max-w-xl rounded-lg bg-white/15" />

            {/* SUMMARY */}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-2xl border border-white/10 bg-white/10"
                />
              ))}
            </div>

            {/* CARDS */}

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

function SkeletonNavbar() {
  return (
    <nav className="border-b border-white/15 bg-[#4338ff]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-11 w-32 animate-pulse rounded-2xl bg-white/20" />

        <div className="hidden gap-2 sm:flex">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-white/15" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-white/15" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-white/20" />
        </div>

        <div className="h-11 w-11 animate-pulse rounded-xl bg-white/15 sm:hidden" />
      </div>
    </nav>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white">
      <div className="h-1.5 bg-zinc-200" />

      <div className="animate-pulse p-5 sm:p-6">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-3 w-24 rounded bg-zinc-200" />

            <div className="mt-2 h-5 w-40 rounded bg-zinc-200" />
          </div>

          <div className="h-7 w-20 rounded-full bg-zinc-200" />
        </div>

        {/* PARKING */}

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

        {/* INFO */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-zinc-100 p-3">
              <div className="h-3 w-16 rounded bg-zinc-200" />
              <div className="mt-3 h-8 rounded bg-zinc-200" />
            </div>
          ))}
        </div>

        {/* BOTTOM */}

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
