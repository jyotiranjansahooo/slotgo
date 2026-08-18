"use client";

import { useState } from "react";

import Script from "next/script";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getApiErrorMessage } from "@/lib/api-error";

import { getBooking } from "@/services/booking.service";

import {
  verifyOvertimePayment,
  type VerifyOvertimePaymentData,
  type VerifyOvertimePaymentResponse,
} from "@/services/payment.service";

import type { ApiResponse } from "@/types/api";

import type { RazorpayResponse } from "@/types/razorpay";

export default function OvertimePaymentPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <OvertimePayment />
    </ProtectedRoute>
  );
}

function OvertimePayment() {
  const router = useRouter();

  const params = useParams();

  /*
   * IMPORTANT
   *
   * Your folder is:
   *
   * [Id]
   *
   * Therefore:
   *
   * params.Id
   *
   * NOT:
   *
   * params.id
   */

  const bookingId = typeof params.Id === "string" ? params.Id : "";

  const [error, setError] = useState("");

  /*
   * ============================================================
   * GET BOOKING
   * ============================================================
   */

  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],

    queryFn: () => getBooking(bookingId),

    enabled: bookingId.length > 0,
  });

  /*
   * ============================================================
   * VERIFY OVERTIME PAYMENT
   * ============================================================
   *
   * IMPORTANT:
   *
   * verifyOvertimePayment() expects ONE object:
   *
   * {
   *   orderId,
   *   paymentId,
   *   signature
   * }
   *
   * Therefore mutationFn also accepts one object.
   */

  const verifyOvertimePaymentMutation = useMutation<
    ApiResponse<VerifyOvertimePaymentResponse>,
    unknown,
    VerifyOvertimePaymentData
  >({
    mutationFn: (data: VerifyOvertimePaymentData) => {
      return verifyOvertimePayment(data);
    },

    onSuccess: () => {
      sessionStorage.removeItem(`slotgo-overtime-payment-${bookingId}`);

      /*
       * Go back to booking details.
       *
       * There is no need for a success page.
       */

      router.push(`/driver/bookings/${bookingId}`);
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading overtime payment...</p>
      </main>
    );
  }

  /*
   * ============================================================
   * BOOKING ERROR
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

  /*
   * ============================================================
   * BOOKING
   * ============================================================
   */

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
   * PAYMENT HANDLER
   * ============================================================
   */

  const handlePayment = () => {
    setError("");

    /*
     * Check Razorpay SDK
     */

    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment gateway is still loading. Please try again.");

      return;
    }

    /*
     * Get payment information created during checkout.
     */

    const storedPayment = sessionStorage.getItem(
      `slotgo-overtime-payment-${bookingId}`,
    );

    if (!storedPayment) {
      setError(
        "Overtime payment information was not found. Please try checkout again.",
      );

      return;
    }

    /*
     * Parse payment information.
     */

    let paymentData: {
      orderId: string;
      amount: number;
      currency: string;
    };

    try {
      paymentData = JSON.parse(storedPayment) as {
        orderId: string;
        amount: number;
        currency: string;
      };
    } catch {
      setError("Invalid overtime payment information.");

      return;
    }

    /*
     * Validate payment information.
     */

    if (!paymentData.orderId || !paymentData.amount || !paymentData.currency) {
      setError("Incomplete overtime payment information.");

      return;
    }

    /*
     * Razorpay
     *
     * Razorpay expects amount in paise.
     *
     * createOvertimePayment() stores:
     *
     * razorpayOrder.amount
     *
     * which is already in paise.
     *
     * Therefore DO NOT multiply by 100 here.
     */

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",

      amount: Math.round(paymentData.amount),

      currency: paymentData.currency,

      name: "SlotGo",

      description: `Overtime payment for ${booking.bookingNumber}`,

      order_id: paymentData.orderId,

      handler: (response: RazorpayResponse) => {
        /*
         * Verify payment on backend.
         */

        verifyOvertimePaymentMutation.mutate({
          orderId: response.razorpay_order_id,

          paymentId: response.razorpay_payment_id,

          signature: response.razorpay_signature,
        });
      },

      theme: {
        color: "#f97316",
      },

      modal: {
        ondismiss: () => {
          setError("Overtime payment was cancelled.");
        },
      },
    });

    razorpay.open();
  };

  /*
   * ============================================================
   * PAYMENT STATE
   * ============================================================
   */

  const isVerifying = verifyOvertimePaymentMutation.isPending;

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="mx-auto max-w-lg">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/driver/bookings/${bookingId}`)}
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to booking
          </button>

          <p className="text-sm text-slate-500">SlotGo Overtime Payment</p>

          <h1 className="mt-1 text-3xl font-bold">Overtime Payment</h1>

          <p className="mt-2 text-slate-400">
            Additional payment is required because your parking duration
            exceeded the original booking time.
          </p>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ======================================================
            PAYMENT CARD
        ====================================================== */}

        <div className="rounded-2xl border border-orange-500/20 bg-white/[0.03] p-6">
          {/* BOOKING */}

          <div className="border-b border-white/10 pb-5">
            <p className="text-xs text-slate-500">Booking</p>

            <p className="mt-1 font-mono text-sm">{booking.bookingNumber}</p>
          </div>

          {/* OVERTIME DETAILS */}

          <div className="space-y-4 py-5">
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

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overtime total</span>

                <span className="text-2xl font-bold text-orange-300">
                  {formatMoney(booking.overtimeTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* PAY BUTTON */}

          <button
            type="button"
            onClick={handlePayment}
            disabled={isVerifying}
            className="w-full rounded-xl bg-orange-600 px-5 py-4 font-semibold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying
              ? "Verifying Payment..."
              : `Pay ${formatMoney(booking.overtimeTotal)}`}
          </button>

          {/* BACK */}

          <button
            type="button"
            onClick={() => router.push(`/driver/bookings/${bookingId}`)}
            className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Back to Booking
          </button>
        </div>
      </div>
    </main>
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
        <h1 className="text-xl font-semibold">
          Unable to load overtime payment
        </h1>

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
