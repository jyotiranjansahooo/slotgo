"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getBookingCheckout } from "@/services/booking.service";

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

  const checkoutQuery = useQuery({
    queryKey: ["booking-checkout", checkoutId],
    queryFn: () => getBookingCheckout(checkoutId),
    enabled: checkoutId.length > 0,
    retry: false,
  });

  const checkout: BookingCheckout | undefined = checkoutQuery.data?.data;

  const verifyMutation = useMutation({
    mutationFn: async (
      data: CheckoutVerificationData,
    ): Promise<CheckoutVerificationResponse> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/bookings/checkout/payment/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.message ??
            responseData?.error ??
            "Payment verification failed.",
        );
      }

      return responseData;
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

  useEffect(() => {
    if (!checkout) {
      return;
    }

    const expiresAt = new Date(checkout.expiresAt).getTime();

    if (Number.isNaN(expiresAt)) {
      return;
    }

    if (expiresAt <= Date.now()) {
      setError(
        "This payment checkout has expired. Please start the booking again.",
      );
      return;
    }

    const timer = window.setTimeout(() => {
      setError(
        "This payment checkout has expired. Please start the booking again.",
      );
    }, expiresAt - Date.now());

    return () => {
      window.clearTimeout(timer);
    };
  }, [checkout]);

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

    const expiresAt = new Date(checkout.expiresAt).getTime();

    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      setError(
        "This payment checkout has expired. Please start the booking again.",
      );
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
      description: `Parking reservation at SlotGo`,
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

  if (!checkoutId) {
    return (
      <ErrorState
        message="Payment checkout ID is missing."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  if (checkoutQuery.isLoading) {
    return <LoadingState />;
  }

  if (checkoutQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(checkoutQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  if (!checkout) {
    return (
      <ErrorState
        message="Booking checkout was not found."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  const expiresAt = new Date(checkout.expiresAt);
  const isExpired =
    Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now();

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

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
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

            <div className="space-y-6 px-5 py-6 sm:px-6">
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

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

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
