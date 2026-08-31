"use client";

import {
  Activity,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getAdminBooking,
  getAdminBookings,
  type AdminBooking,
} from "@/services/admin.service";

import { getApiErrorMessage } from "@/lib/api-error";

type BookingFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "expired";

export default function AdminBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminBookings />
    </ProtectedRoute>
  );
}

function AdminBookings() {
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );

  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getAdminBookings,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const bookings = bookingsQuery.data ?? [];

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = normalizeStatus(booking.bookingStatus);

      const matchesFilter = filter === "all" || status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        booking.bookingNumber,
        booking._id,
        booking.parkingId,
        booking.userId,
        booking.slotId,
        booking.bookingStatus,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [bookings, filter, search]);

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: countStatus(bookings, "pending"),
      confirmed: countStatus(bookings, "confirmed"),
      active: countStatus(bookings, "active"),
      completed: countStatus(bookings, "completed"),
      cancelled: countStatus(bookings, "cancelled"),
      expired: countStatus(bookings, "expired"),
    };
  }, [bookings]);

  const handleRefresh = async () => {
    await bookingsQuery.refetch();
  };

  if (bookingsQuery.isLoading) {
    return <BookingsLoading />;
  }

  if (bookingsQuery.isError) {
    return (
      <main className="min-h-screen bg-[#06544E] px-4 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-300/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
          <XCircle className="mx-auto h-12 w-12 text-red-300" />

          <h1 className="mt-5 text-2xl font-bold">Unable to load bookings</h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {getApiErrorMessage(bookingsQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => void handleRefresh()}
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
      {/* BACKGROUND */}

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

      <AdminNavbar />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-100/50">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Bookings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Monitor and inspect all SlotGo bookings from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={bookingsQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                bookingsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </header>

        {/* SUMMARY */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Bookings"
            value={counts.all}
            icon={CalendarDays}
          />

          <SummaryCard label="Active" value={counts.active} icon={Activity} />

          <SummaryCard label="Pending" value={counts.pending} icon={Clock3} />

          <SummaryCard
            label="Completed"
            value={counts.completed}
            icon={CheckCircle2}
          />
        </section>

        {/* FILTERS */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4">
            {/* SEARCH */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking number, booking ID, parking ID, user ID..."
                className="h-12 w-full rounded-xl border border-white/10 bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-200/30"
              />
            </div>

            {/* FILTERS */}

            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={filter === "all"}
                label="All"
                count={counts.all}
                onClick={() => setFilter("all")}
              />

              <FilterButton
                active={filter === "pending"}
                label="Pending"
                count={counts.pending}
                onClick={() => setFilter("pending")}
              />

              <FilterButton
                active={filter === "confirmed"}
                label="Confirmed"
                count={counts.confirmed}
                onClick={() => setFilter("confirmed")}
              />

              <FilterButton
                active={filter === "active"}
                label="Active"
                count={counts.active}
                onClick={() => setFilter("active")}
              />

              <FilterButton
                active={filter === "completed"}
                label="Completed"
                count={counts.completed}
                onClick={() => setFilter("completed")}
              />

              <FilterButton
                active={filter === "cancelled"}
                label="Cancelled"
                count={counts.cancelled}
                onClick={() => setFilter("cancelled")}
              />

              <FilterButton
                active={filter === "expired"}
                label="Expired"
                count={counts.expired}
                onClick={() => setFilter("expired")}
              />
            </div>
          </div>
        </section>

        {/* RESULT COUNT */}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-white/40">
            Showing{" "}
            <span className="font-semibold text-white/70">
              {filteredBookings.length}
            </span>{" "}
            booking
            {filteredBookings.length === 1 ? "" : "s"}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-emerald-200/70 transition hover:text-emerald-100"
            >
              Clear search
            </button>
          )}
        </div>

        {/* BOOKINGS */}

        <section className="mt-4">
          {filteredBookings.length === 0 ? (
            <EmptyBookings
              hasSearch={Boolean(search)}
              hasFilter={filter !== "all"}
              onClear={() => {
                setSearch("");
                setFilter("all");
              }}
            />
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onView={() => setSelectedBooking(booking)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* DETAILS MODAL */}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </main>
  );
}



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
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>

        <span className="text-xs text-white/25">SlotGo</span>
      </div>

      <p className="mt-5 text-sm text-white/40">{label}</p>

      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
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
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-emerald-200/20 bg-emerald-300/10 text-emerald-100"
          : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07] hover:text-white"
      }`}
    >
      {label}

      <span className="ml-2 rounded-md bg-black/20 px-1.5 py-0.5 text-[10px]">
        {count}
      </span>
    </button>
  );
}

function BookingCard({
  booking,
  onView,
}: {
  booking: AdminBooking;
  onView: () => void;
}) {
  const status = normalizeStatus(booking.bookingStatus);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:border-white/15 hover:bg-white/[0.075] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-black/10 px-2.5 py-1 font-mono text-xs text-white/60">
              {booking.bookingNumber || shortId(booking._id)}
            </span>

            <StatusBadge status={status} />
          </div>

          <h2 className="mt-3 truncate text-lg font-semibold">Booking</h2>

          <p className="mt-1 text-xs text-white/30">
            Created{" "}
            {booking.createdAt ? formatDateTime(booking.createdAt) : "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[600px]">
          <DataItem
            icon={CarFront}
            label="Parking"
            value={shortId(booking.parkingId)}
          />

          <DataItem
            icon={Activity}
            label="Slot"
            value={shortId(booking.slotId)}
          />

          <DataItem
            icon={CreditCard}
            label="Amount"
            value={
              booking.totalAmount !== undefined
                ? formatCurrency(booking.totalAmount, booking.currency)
                : "—"
            }
          />

          <DataItem
            icon={CalendarDays}
            label="Start"
            value={booking.startTime ? formatDateTime(booking.startTime) : "—"}
          />
        </div>

        <button
          type="button"
          onClick={onView}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>
    </article>
  );
}


function DataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/[0.08] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/25" />

        <span className="truncate text-[10px] uppercase tracking-wider text-white/25">
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
| STATUS
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }: { status: BookingFilter }) {
  const config: Record<
    BookingFilter,
    {
      label: string;
      className: string;
    }
  > = {
    all: {
      label: "All",
      className: "border-white/10 bg-white/5 text-white/50",
    },

    pending: {
      label: "Pending",
      className: "border-amber-200/10 bg-amber-300/10 text-amber-100",
    },

    confirmed: {
      label: "Confirmed",
      className: "border-sky-200/10 bg-sky-300/10 text-sky-100",
    },

    active: {
      label: "Active",
      className: "border-emerald-200/10 bg-emerald-300/10 text-emerald-100",
    },

    completed: {
      label: "Completed",
      className: "border-green-200/10 bg-green-300/10 text-green-100",
    },

    cancelled: {
      label: "Cancelled",
      className: "border-red-200/10 bg-red-300/10 text-red-100",
    },

    expired: {
      label: "Expired",
      className: "border-white/10 bg-white/5 text-white/40",
    },
  };

  const item = config[status];

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.className}`}
    >
      {item.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| DETAILS MODAL
|--------------------------------------------------------------------------
*/

function BookingDetailsModal({
  booking,
  onClose,
}: {
  booking: AdminBooking;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<AdminBooking | null>(booking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDetails = async () => {
    if (details !== booking) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getAdminBooking(booking._id);

      setDetails(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#075951] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#075951]/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/30">
              Booking details
            </p>

            <h2 className="mt-1 font-semibold">
              {booking.bookingNumber || shortId(booking._id)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-200" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200/10 bg-red-300/10 p-5">
              <p className="text-sm text-red-100">{error}</p>

              <button
                type="button"
                onClick={() => void loadDetails()}
                className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#06544E]"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <StatusBadge status={normalizeStatus(details?.bookingStatus)} />

                <button
                  type="button"
                  onClick={() => void loadDetails()}
                  className="text-xs font-semibold text-emerald-200/60 transition hover:text-emerald-100"
                >
                  Load latest details
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailItem label="Booking ID" value={details?._id} />

                <DetailItem
                  label="Booking Number"
                  value={details?.bookingNumber}
                />

                <DetailItem label="User ID" value={details?.userId} />

                <DetailItem label="Parking ID" value={details?.parkingId} />

                <DetailItem label="Slot ID" value={details?.slotId} />

                <DetailItem label="Currency" value={details?.currency} />

                <DetailItem
                  label="Parking Amount"
                  value={
                    details?.parkingAmount !== undefined
                      ? formatCurrency(details.parkingAmount, details.currency)
                      : undefined
                  }
                />

                <DetailItem
                  label="Driver Service Fee"
                  value={
                    details?.driverServiceFee !== undefined
                      ? formatCurrency(
                          details.driverServiceFee,
                          details.currency,
                        )
                      : undefined
                  }
                />

                <DetailItem
                  label="Total Amount"
                  value={
                    details?.totalAmount !== undefined
                      ? formatCurrency(details.totalAmount, details.currency)
                      : undefined
                  }
                />

                <DetailItem
                  label="Start Time"
                  value={
                    details?.startTime
                      ? formatDateTime(details.startTime)
                      : undefined
                  }
                />

                <DetailItem
                  label="End Time"
                  value={
                    details?.endTime
                      ? formatDateTime(details.endTime)
                      : undefined
                  }
                />

                <DetailItem
                  label="Created At"
                  value={
                    details?.createdAt
                      ? formatDateTime(details.createdAt)
                      : undefined
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL ITEM
|--------------------------------------------------------------------------
*/

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-white/70">
        {value || "—"}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY
|--------------------------------------------------------------------------
*/

function EmptyBookings({
  hasSearch,
  hasFilter,
  onClear,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center backdrop-blur-xl">
      <CalendarDays className="mx-auto h-10 w-10 text-white/15" />

      <h2 className="mt-4 text-lg font-semibold">No bookings found</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {hasSearch || hasFilter
          ? "Try changing your search or status filter."
          : "There are no bookings available yet."}
      </p>

      {(hasSearch || hasFilter) && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#06544E] transition hover:bg-white/90"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function BookingsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06544E] text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" />

        <p className="mt-4 text-sm text-white/40">Loading bookings...</p>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizeStatus(value?: string): BookingFilter {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  if (status === "pending") return "pending";
  if (status === "confirmed") return "confirmed";
  if (status === "active") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "canceled") {
    return "cancelled";
  }
  if (status === "expired") return "expired";

  return "all";
}

function countStatus(bookings: AdminBooking[], status: BookingFilter) {
  return bookings.filter(
    (booking) => normalizeStatus(booking.bookingStatus) === status,
  ).length;
}

function shortId(value?: string) {
  if (!value) {
    return "—";
  }

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
