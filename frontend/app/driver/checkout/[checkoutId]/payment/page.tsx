"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getBookingCheckout, verifyPayment } from "@/services/booking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { RazorpayResponse } from "@/types/razorpay";
import type { BookingCheckout } from "@/types/booking";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };

  handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface CheckoutVerificationData {
  checkoutId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

interface CheckoutVerificationResponse {
  booking: {
    _id: string;
    bookingNumber?: string;
  };
}

const CHECKOUT_EXPIRED_MESSAGE =
  "This payment checkout has expired. Please start the booking again.";

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

  const checkoutId =
    typeof params.checkoutId === "string" ? params.checkoutId : "";

  const [error, setError] = useState("");
  const [isGatewayReady, setIsGatewayReady] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);

  /*
   * React-safe clock.
   *
   * We do not call Date.now() during render.
   */
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * GET CHECKOUT
   */
  const checkoutQuery = useQuery({
    queryKey: ["booking-checkout", checkoutId],

    queryFn: () => getBookingCheckout(checkoutId),

    enabled: checkoutId.length > 0,

    retry: false,
  });

  const checkout: BookingCheckout | undefined = checkoutQuery.data?.data;

  /*
   * CHECKOUT EXPIRATION
   */
  const expiresAtMs = checkout
    ? new Date(checkout.expiresAt).getTime()
    : Number.NaN;

  const isInvalidExpiry = Number.isNaN(expiresAtMs);

  const isExpired =
    Boolean(checkout) &&
    (isInvalidExpiry || (currentTime > 0 && expiresAtMs <= currentTime));

  /*
   * Show expiration as derived UI state.
   *
   * We do NOT call setError() from an effect.
   */
  const displayError = isExpired ? CHECKOUT_EXPIRED_MESSAGE : error;

  /*
   * VERIFY PAYMENT
   *
   * IMPORTANT:
   *
   * We now use the project's Axios API service instead
   * of raw fetch().
   *
   * This means the same authentication mechanism used by
   * the rest of the application is used here as well.
   */
  const verifyMutation = useMutation({
    mutationFn: async (
      data: CheckoutVerificationData,
    ): Promise<CheckoutVerificationResponse> => {
      const response = await verifyPayment(data);

      if (!response?.data) {
        throw new Error(
          "Payment verification succeeded but no booking was returned.",
        );
      }

      return response.data;
    },

    onSuccess: (response) => {
      setError("");
      setPaymentStarted(false);

      const bookingId = response.booking?._id;

      if (!bookingId) {
        setError(
          "Payment was successful, but the booking ID was not returned.",
        );

        return;
      }

      router.replace(`/driver/bookings/${bookingId}`);
    },

    onError: (mutationError: unknown) => {
      setPaymentStarted(false);

      setError(getApiErrorMessage(mutationError));
    },
  });

  /*
   * OPEN RAZORPAY
   */
  const handlePayment = () => {
    setError("");

    if (!checkout) {
      setError("Payment checkout information is not available.");

      return;
    }

    if (verifyMutation.isPending || paymentStarted) {
      return;
    }

    if (!isGatewayReady || typeof window === "undefined") {
      setError("Payment gateway is still loading. Please try again.");

      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";

    if (!razorpayKey) {
      setError(
        "Razorpay is not configured. Please check NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      );

      return;
    }

    /*
     * Date.now() is safe here because this function
     * runs from a user event, not during render.
     */
    const checkoutExpiresAt = new Date(checkout.expiresAt).getTime();

    if (Number.isNaN(checkoutExpiresAt) || checkoutExpiresAt <= Date.now()) {
      setError(CHECKOUT_EXPIRED_MESSAGE);

      return;
    }

    if (!checkout.orderId) {
      setError("Payment order ID is missing.");

      return;
    }

    if (!checkout.driverPays || checkout.driverPays <= 0) {
      setError("Invalid payment amount.");

      return;
    }

    setPaymentStarted(true);

    const razorpay = new window.Razorpay({
      key: razorpayKey,

      amount: Math.round(checkout.driverPays * 100),

      currency: "INR",

      name: "SlotGo",

      description: "Parking reservation at SlotGo",

      order_id: checkout.orderId,

      theme: {
        color: "#2563eb",
      },

      modal: {
        ondismiss: () => {
          setPaymentStarted(false);

          setError("Payment was cancelled.");
        },
      },

      handler: (response: RazorpayResponse) => {
        /*
         * Razorpay must return all three values.
         */
        if (
          !response.razorpay_order_id ||
          !response.razorpay_payment_id ||
          !response.razorpay_signature
        ) {
          setPaymentStarted(false);

          setError(
            "Razorpay did not return complete payment verification details.",
          );

          return;
        }

        /*
         * Send payment details to our backend.
         *
         * The verifyPayment service uses the application's
         * authenticated Axios client.
         */
        verifyMutation.mutate({
          checkoutId,

          orderId: response.razorpay_order_id,

          paymentId: response.razorpay_payment_id,

          signature: response.razorpay_signature,
        });
      },
    });

    razorpay.open();
  };

  /*
   * CHECKOUT ID MISSING
   */
  if (!checkoutId) {
    return (
      <ErrorState
        message="Payment checkout ID is missing."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * LOADING
   */
  if (checkoutQuery.isLoading) {
    return <LoadingState />;
  }

  /*
   * API ERROR
   */
  if (checkoutQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(checkoutQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * NO CHECKOUT
   */
  if (!checkout) {
    return (
      <ErrorState
        message="Booking checkout was not found."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setIsGatewayReady(true)}
        onError={() =>
          setError(
            "Unable to load the payment gateway. Please refresh and try again.",
          )
        }
      />

      <div className="mx-auto mt-12 w-full max-w-2xl sm:mt-16">
        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/driver/parkings")}
            disabled={verifyMutation.isPending}
            className="mb-5 text-sm text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to parking
          </button>

          <p className="text-sm font-medium text-blue-400">SlotGo Payment</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Payment
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Complete your payment to confirm this parking reservation.
          </p>
        </div>

        {/* ERROR */}
        {displayError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
          >
            {displayError}
          </div>
        )}

        <div className="space-y-6">
          {/* CHECKOUT CARD */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {/* CARD HEADER */}
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Payment checkout
                  </p>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {checkout._id}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    isExpired
                      ? "bg-red-500/10 text-red-300"
                      : "bg-yellow-500/10 text-yellow-300"
                  }`}
                >
                  {isExpired ? "Expired" : "Payment Pending"}
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="space-y-6 px-5 py-6 sm:px-6">
              {/* RESERVATION */}
              <section>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Reservation
                </p>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Booking type"
                    value={formatBookingMode(checkout.bookingMode)}
                  />

                  <InfoItem
                    label="Vehicle type"
                    value={formatVehicleType(checkout.vehicleType)}
                  />

                  <InfoItem
                    label="Start"
                    value={formatDate(checkout.startTime)}
                  />

                  <InfoItem label="End" value={formatDate(checkout.endTime)} />
                </div>
              </section>

              {/* PAYMENT */}
              <section className="border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Payment
                </p>

                <div className="mt-4 space-y-4">
                  <SummaryRow
                    label="Parking amount"
                    value={formatMoney(checkout.parkingAmount)}
                  />

                  {checkout.discountAmount > 0 && (
                    <SummaryRow
                      label="Discount"
                      value={`-${formatMoney(checkout.discountAmount)}`}
                      valueClassName="text-emerald-400"
                    />
                  )}

                  <SummaryRow
                    label="Service fee"
                    value={formatMoney(checkout.driverServiceFee)}
                  />

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-white">Total</span>

                      <span className="text-2xl font-bold text-emerald-400 sm:text-3xl">
                        {formatMoney(checkout.driverPays)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAYMENT-FIRST INFORMATION */}
              <section className="border-t border-white/10 pt-6">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-blue-400/40 bg-blue-400/10" />

                    <div>
                      <p className="text-sm font-medium text-blue-200">
                        Payment-first booking
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Your parking booking will be created only after Razorpay
                        successfully verifies the payment.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAY BUTTON */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  isExpired || verifyMutation.isPending || paymentStarted
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyMutation.isPending ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying Payment...
                  </span>
                ) : paymentStarted ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Opening Payment...
                  </span>
                ) : isExpired ? (
                  "Checkout Expired"
                ) : isGatewayReady ? (
                  `Pay ${formatMoney(checkout.driverPays)}`
                ) : (
                  "Loading Payment Gateway..."
                )}
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                disabled={verifyMutation.isPending || paymentStarted}
                className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel and Return
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY ROW                                                                */
/* -------------------------------------------------------------------------- */

function SummaryRow({
  label,
  value,
  valueClassName = "text-slate-200",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>

      <span className={`text-right text-sm font-medium ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING STATE                                                              */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

        <p className="text-sm text-slate-400">Loading payment checkout...</p>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* ERROR STATE                                                                */
/* -------------------------------------------------------------------------- */

function ErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-950/20 p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
          !
        </div>

        <h1 className="text-xl font-semibold">Unable to load payment</h1>

        <p className="mt-2 text-sm leading-6 text-red-300">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200"
        >
          Go Back
        </button>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* FORMAT DATE                                                                */
/* -------------------------------------------------------------------------- */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* FORMAT MONEY                                                               */
/* -------------------------------------------------------------------------- */

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/* -------------------------------------------------------------------------- */
/* FORMAT BOOKING MODE                                                        */
/* -------------------------------------------------------------------------- */

function formatBookingMode(value: string): string {
  switch (value) {
    case "hourly":
      return "Hourly";

    case "daily":
      return "Daily";

    case "monthly":
      return "Monthly";

    default:
      return value;
  }
}

/* -------------------------------------------------------------------------- */
/* FORMAT VEHICLE TYPE                                                        */
/* -------------------------------------------------------------------------- */

function formatVehicleType(value: string): string {
  switch (value) {
    case "twoWheeler":
      return "Two Wheeler";

    case "fourWheeler":
      return "Four Wheeler";

    case "vanMinibus":
      return "Van / Minibus";

    case "heavyVehicle":
      return "Heavy Vehicle";

    default:
      return value;
  }
}
