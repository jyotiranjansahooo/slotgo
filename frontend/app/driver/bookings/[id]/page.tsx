"use client";

import { useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getBooking,
  checkOutBooking,
  createOvertimePayment,
} from "@/services/booking.service";

import { getApiErrorMessage } from "@/lib/api-error";

export default function BookingDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <BookingDetails />
    </ProtectedRoute>
  );
}

function BookingDetails() {
  const router = useRouter();
  const params = useParams();

  const bookingId = typeof params.Id === "string" ? params.Id : "";

  const [error, setError] = useState("");


  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],

    queryFn: () => getBooking(bookingId),

    enabled: bookingId.length > 0,
  });

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   *
   * Backend decides whether overtime payment is required.
   */

  const checkoutMutation = useMutation({
    mutationFn: () => checkOutBooking(bookingId),

    onSuccess: (response) => {
      setError("");

      const result = response.data;

      /*
       * Overtime payment required.
       */

      if (result?.requiresAdditionalPayment) {
        /*
         * Create the Razorpay overtime order.
         */

        overtimePaymentMutation.mutate(bookingId);

        return;
      }

      /*
       * Normal checkout completed.
       */

      bookingQuery.refetch();
    },

    onError: (mutationError: unknown) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  /*
   * ============================================================
   * CREATE OVERTIME PAYMENT
   * ============================================================
   */

  const overtimePaymentMutation = useMutation({
    mutationFn: (id: string) => createOvertimePayment(id),

    onSuccess: (response) => {
      setError("");

      const payment = response.data;

      if (!payment?.razorpayOrder?.id) {
        setError("Overtime payment order was not created.");

        return;
      }

      /*
       * Store overtime payment information.
       *
       * The overtime payment page can use
       * this information to open Razorpay.
       */

      sessionStorage.setItem(
        `slotgo-overtime-payment-${bookingId}`,
        JSON.stringify({
          orderId: payment.razorpayOrder.id,

          amount: payment.razorpayOrder.amount,

          currency: payment.razorpayOrder.currency,
        }),
      );

      router.push(`/driver/bookings/${bookingId}/overtime-payment`);
    },

    onError: (mutationError: unknown) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (bookingQuery.isLoading) {
    return <LoadingState />;
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (bookingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(bookingQuery.error)}
        onBack={() => router.push("/driver/bookings")}
      />
    );
  }

  const booking = bookingQuery.data?.data;

  if (!booking) {
    return (
      <ErrorState
        message="Booking not found."
        onBack={() => router.push("/driver/bookings")}
      />
    );
  }

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const statusLabel = booking.bookingStatus;

  /*
   * ============================================================
   * CHECKOUT BUTTON STATE
   * ============================================================
   */

  const isCheckingOut =
    checkoutMutation.isPending || overtimePaymentMutation.isPending;

  const canCheckout = booking.bookingStatus === "active";

  /*
   * ============================================================
   * PAYMENT STATE
   * ============================================================
   */

  const isPaid = booking.paymentStatus === "paid";

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/driver/bookings")}
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to bookings
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-slate-500">Booking</p>

              <h1 className="mt-1 font-mono text-2xl font-bold">
                {booking.bookingNumber}
              </h1>
            </div>

            <StatusBadge status={statusLabel} />
          </div>
        </div>

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* ====================================================
              BOOKING INFORMATION
              ==================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Booking Details</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoItem label="Booking type" value={booking.bookingMode} />

              <InfoItem label="Payment status" value={booking.paymentStatus} />

              <InfoItem label="Start" value={formatDate(booking.startTime)} />

              <InfoItem label="End" value={formatDate(booking.endTime)} />

              {booking.checkedInAt && (
                <InfoItem
                  label="Checked in"
                  value={formatDate(booking.checkedInAt)}
                />
              )}

              {booking.checkedOutAt && (
                <InfoItem
                  label="Checked out"
                  value={formatDate(booking.checkedOutAt)}
                />
              )}
            </div>
          </section>

          {/* ====================================================
              VEHICLE
              ==================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Vehicle</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Vehicle"
                value={`${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.vehicleModel}`}
              />

              <InfoItem
                label="Registration"
                value={booking.vehicleSnapshot.registrationNumber}
              />

              <InfoItem
                label="Vehicle type"
                value={booking.vehicleSnapshot.vehicleType}
              />
            </div>
          </section>

          {/* ====================================================
              PARKING
              ==================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Parking</h2>

            <div className="mt-5 space-y-4">
              <InfoItem
                label="Parking"
                value={booking.parkingSnapshot.parkingName}
              />

              <InfoItem
                label="Address"
                value={booking.parkingSnapshot.address}
              />
            </div>
          </section>

          {/* ====================================================
              PAYMENT SUMMARY
              ==================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Payment Summary</h2>

            <div className="mt-5 space-y-4">
              <SummaryRow
                label="Parking amount"
                value={formatMoney(booking.parkingAmount)}
              />

              {booking.discountAmount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-${formatMoney(booking.discountAmount)}`}
                />
              )}

              <SummaryRow
                label="Service fee"
                value={formatMoney(booking.driverServiceFee)}
              />

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total paid</span>

                  <span className="text-2xl font-bold">
                    {formatMoney(booking.driverPays)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              OVERTIME INFORMATION
              ==================================================== */}

          {booking.overtimeMinutes > 0 && (
            <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-orange-300">
                Overtime
              </h2>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  label="Overtime"
                  value={`${booking.overtimeMinutes} minutes`}
                />

                <SummaryRow
                  label="Additional parking"
                  value={formatMoney(booking.overtimeParkingAmount)}
                />

                <SummaryRow
                  label="Overtime fine"
                  value={formatMoney(booking.overtimeFine)}
                />

                <div className="border-t border-orange-500/20 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overtime total</span>

                    <span className="text-xl font-bold text-orange-300">
                      {formatMoney(booking.overtimeTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ====================================================
              CHECKOUT
              ==================================================== */}

          {canCheckout && (
            <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Check Out</h2>

              <p className="mt-2 text-sm text-slate-400">
                When you check out, SlotGo will calculate any overtime
                automatically.
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");

                  checkoutMutation.mutate();
                }}
                disabled={isCheckingOut}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutMutation.isPending
                  ? "Checking Out..."
                  : overtimePaymentMutation.isPending
                    ? "Preparing Overtime Payment..."
                    : "Check Out"}
              </button>
            </section>
          )}

          {/* ====================================================
              PAYMENT MESSAGE
              ==================================================== */}

          {!isPaid && (
            <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-sm text-yellow-300">
                This booking payment has not been completed yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(`/driver/bookings/${bookingId}/payment`)
                }
                className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
              >
                Complete Payment
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * STATUS BADGE
 * ============================================================
 */

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
      className={`w-fit rounded-full px-3 py-1 text-xs capitalize ${className}`}
    >
      {status}
    </span>
  );
}

/*
 * ============================================================
 * INFO ITEM
 * ============================================================
 */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

/*
 * ============================================================
 * SUMMARY ROW
 * ============================================================
 */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

/*
 * ============================================================
 * LOADING
 * ============================================================
 */

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <p className="text-slate-400">Loading booking...</p>
    </main>
  );
}

/*
 * ============================================================
 * ERROR STATE
 * ============================================================
 */

function ErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <h1 className="text-xl font-semibold">Unable to load booking</h1>

        <p className="mt-2 text-sm text-red-300">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Back
        </button>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * DATE FORMAT
 * ============================================================
 */

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

/*
 * ============================================================
 * MONEY FORMAT
 * ============================================================
 */

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
