"use client";

import { useState } from "react";

import Script from "next/script";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getBooking } from "@/services/booking.service";
import { verifyPayment } from "@/services/payment.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { RazorpayResponse } from "@/types/razorpay";

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


const bookingId = typeof params.Id === "string" ? params.Id : "";

  const [error, setError] = useState("");


  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],

    queryFn: () => getBooking(bookingId),

    enabled: bookingId.length > 0,
  });

  /*
   * ============================================================
   * PAYMENT VERIFICATION
   * ============================================================
   */

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,

  onSuccess: () => {
  sessionStorage.removeItem(
    `slotgo-payment-${bookingId}`,
  );

  router.push(
    `/driver/bookings/${bookingId}`,
  );
},

    onError: (mutationError: unknown) => {
      setError(
        getApiErrorMessage(mutationError),
      );
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
        <p className="text-slate-400">
          Loading payment...
        </p>
      </main>
    );
  }

  /*
   * ============================================================
   * BOOKING QUERY ERROR
   * ============================================================
   */

  if (bookingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          bookingQuery.error,
        )}
        onBack={() =>
          router.push("/driver/bookings")
        }
      />
    );
  }

  /*
   * ============================================================
   * BOOKING
   * ============================================================
   */

  const booking =
    bookingQuery.data?.data;

  if (!booking) {
    return (
      <ErrorState
        message="Booking not found."
        onBack={() =>
          router.push("/driver/bookings")
        }
      />
    );
  }

  /*
   * ============================================================
   * HANDLE RAZORPAY PAYMENT
   * ============================================================
   */

  const handlePayment = () => {
    setError("");

    /*
     * Razorpay script must be loaded.
     */

    if (
      typeof window === "undefined" ||
      !window.Razorpay
    ) {
      setError(
        "Payment gateway is still loading. Please try again.",
      );

      return;
    }

    /*
     * Retrieve payment information created
     * during booking creation.
     */

    const storedPayment =
      sessionStorage.getItem(
        `slotgo-payment-${bookingId}`,
      );

    if (!storedPayment) {
      setError(
        "Payment information was not found. Please create the booking again.",
      );

      return;
    }

    /*
     * Parse stored payment information.
     */

    let paymentData: {
      orderId: string;
      amount: number;
      currency: string;
    };

    try {
      paymentData =
        JSON.parse(storedPayment) as {
          orderId: string;
          amount: number;
          currency: string;
        };
    } catch {
      setError(
        "Invalid payment information.",
      );

      return;
    }

    /*
     * Validate payment information.
     */

    if (
      !paymentData.orderId ||
      !paymentData.amount ||
      !paymentData.currency
    ) {
      setError(
        "Incomplete payment information.",
      );

      return;
    }

    /*
     * ==========================================================
     * CREATE RAZORPAY CHECKOUT
     * ==========================================================
     *
     * Backend stores payment.amount in INR.
     *
     * Razorpay expects amount in PAISE.
     *
     * Example:
     *
     * ₹100
     *
     * becomes:
     *
     * 10000 paise
     */

    const razorpay =
      new window.Razorpay({
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",

        amount: Math.round(
          paymentData.amount * 100,
        ),

        currency:
          paymentData.currency,

        name: "SlotGo",

        description:
          `Parking booking ${booking.bookingNumber}`,

        order_id:
          paymentData.orderId,

        handler: (
          response: RazorpayResponse,
        ) => {
          /*
           * Razorpay successfully completed
           * the payment.
           *
           * Now verify the signature
           * through our backend.
           */

          verifyMutation.mutate({
            orderId:
              response.razorpay_order_id,

            paymentId:
              response.razorpay_payment_id,

            signature:
              response.razorpay_signature,
          });
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => {
            /*
             * Don't show cancellation error
             * while verification is already running.
             */

            if (
              !verifyMutation.isPending
            ) {
              setError(
                "Payment was cancelled.",
              );
            }
          },
        },
      });

    /*
     * Open Razorpay checkout.
     */

    razorpay.open();
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      {/* ========================================================
          RAZORPAY SCRIPT
          ======================================================== */}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="mx-auto max-w-lg">
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="mb-8">
          <p className="text-sm text-slate-500">
            SlotGo Payment
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Complete Payment
          </h1>

          <p className="mt-2 text-slate-400">
            Complete payment to confirm your
            parking booking.
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {/* BOOKING HEADER */}

          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs text-slate-500">
                Booking
              </p>

              <p className="mt-1 font-mono text-sm">
                {booking.bookingNumber}
              </p>
            </div>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs capitalize text-yellow-300">
              {booking.bookingStatus}
            </span>
          </div>

          {/* BOOKING SUMMARY */}

          <div className="space-y-4 py-5">
            <SummaryRow
              label="Booking type"
              value={booking.bookingMode}
            />

            <SummaryRow
              label="Start"
              value={formatDate(
                booking.startTime,
              )}
            />

            <SummaryRow
              label="End"
              value={formatDate(
                booking.endTime,
              )}
            />

            <SummaryRow
              label="Parking amount"
              value={formatMoney(
                booking.parkingAmount,
                "INR",
              )}
            />

            {booking.discountAmount > 0 && (
              <SummaryRow
                label="Discount"
                value={`-${formatMoney(
                  booking.discountAmount,
                  "INR",
                )}`}
              />
            )}

            <SummaryRow
              label="Service fee"
              value={formatMoney(
                booking.driverServiceFee,
                "INR",
              )}
            />

            {/* TOTAL */}

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  {formatMoney(
                    booking.driverPays,
                    "INR",
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              PAY BUTTON
              ================================================== */}

          <button
            type="button"
            onClick={handlePayment}
            disabled={
              verifyMutation.isPending
            }
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyMutation.isPending
              ? "Verifying Payment..."
              : `Pay ${formatMoney(
                  booking.driverPays,
                  "INR",
                )}`}
          </button>

          {/* ==================================================
              VIEW BOOKING
              ================================================== */}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/driver/bookings/${bookingId}`,
              )
            }
            className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            View Booking
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

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm text-slate-200">
        {value}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * FORMAT DATE
 * ============================================================
 */

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

/*
 * ============================================================
 * FORMAT MONEY
 * ============================================================
 */

function formatMoney(
  amount: number,
  currency: string,
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

/*
 * ============================================================
 * ERROR STATE
 * ============================================================
 */

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({
  message,
  onBack,
}: ErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <h1 className="text-xl font-semibold">
          Unable to load booking
        </h1>

        <p className="mt-2 text-sm text-red-300">
          {message}
        </p>

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