"use client";

import {  useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getBooking } from "@/services/booking.service";

import { getApiErrorMessage } from "@/lib/api-error";

export default function PaymentPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <Payment />
    </ProtectedRoute>
  );
}

function Payment() {
  const router = useRouter();
  const params = useParams();

  const bookingId = typeof params.id === "string" ? params.id : "";

  const [error, setError] = useState("");

  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],

    queryFn: () => getBooking(bookingId),

    enabled: bookingId.length > 0,
  });

  if (bookingQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading payment...</p>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <p className="text-sm text-slate-500">SlotGo Payment</p>

          <h1 className="mt-1 text-3xl font-bold">Complete Payment</h1>

          <p className="mt-2 text-slate-400">
            Complete payment to confirm your parking booking.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs text-slate-500">Booking</p>

              <p className="mt-1 font-mono text-sm">{booking.bookingNumber}</p>
            </div>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs capitalize text-yellow-300">
              {booking.bookingStatus}
            </span>
          </div>

          <div className="space-y-4 py-5">
            <SummaryRow label="Booking type" value={booking.bookingMode} />

            <SummaryRow label="Start" value={formatDate(booking.startTime)} />

            <SummaryRow label="End" value={formatDate(booking.endTime)} />

            <SummaryRow
              label="Parking amount"
              value={formatMoney(booking.parkingAmount, "INR")}
            />

            <SummaryRow
              label="Service fee"
              value={formatMoney(booking.driverServiceFee, "INR")}
            />

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>

                <span className="text-2xl font-bold">
                  value={formatMoney(booking.driverPays, "INR")}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("Razorpay checkout will be connected in the next step.");
            }}
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500"
          >
            Pay Now
          </button>

          <button
            type="button"
            onClick={() => router.push(`/driver/bookings/${bookingId}`)}
            className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            View Booking
          </button>
        </div>
      </div>
    </main>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({ message, onBack }: ErrorStateProps) {
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
