"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getParking } from "@/services/parking.service";
import { getMyVehicles } from "@/services/vehicle.service";
import { createBooking } from "@/services/booking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { BookingMode } from "@/types/booking";
import type { Vehicle } from "@/types/vehicle";

type BookingTiming = "now" | "future";

interface BookingModeOption {
  value: BookingMode;
  label: string;
  description: string;
}

export default function BookingPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <BookingForm />
    </ProtectedRoute>
  );
}

function BookingForm() {
  const params = useParams();
  const router = useRouter();

  const parkingId = typeof params.id === "string" ? params.id : "";

  const [vehicleId, setVehicleId] = useState("");

  const [bookingTiming, setBookingTiming] = useState<BookingTiming>("now");

  const [bookingMode, setBookingMode] = useState<BookingMode>("hourly");

  const [duration, setDuration] = useState(1);

  const [futureStartTime, setFutureStartTime] = useState("");

  const [minimumDateTime, setMinimumDateTime] = useState("");

  const [error, setError] = useState("");

  /*
   * CURRENT TIME
   *
   * We keep time in state instead of calling Date.now()
   * directly during render.
   */

  useEffect(() => {
    const updateMinimumDateTime = () => {
      const now = new Date();

      const offset = now.getTimezoneOffset();

      const localDate = new Date(now.getTime() - offset * 60 * 1000);

      setMinimumDateTime(localDate.toISOString().slice(0, 16));
    };

    updateMinimumDateTime();

    const interval = window.setInterval(updateMinimumDateTime, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * PARKING
   */

  const parkingQuery = useQuery({
    queryKey: ["parking", parkingId],

    queryFn: () => getParking(parkingId),

    enabled: parkingId.length > 0,
  });

  /*
   * VEHICLES
   */

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],

    queryFn: () => getMyVehicles(),
  });

  /*
   * AVAILABLE BOOKING MODES
   */

 const availableModes = useMemo(() => {
  const bookingModes =
    parkingQuery.data?.data?.parking?.bookingModes;

  if (!bookingModes) {
    return [];
  }

  const modes: BookingModeOption[] = [
    {
      value: "hourly",
      label: "Hourly",
      description: "Choose number of hours",
    },
    {
      value: "daily",
      label: "Daily",
      description: "Choose number of days",
    },
    {
      value: "monthly",
      label: "Monthly",
      description: "Choose number of months",
    },
  ];

  return modes.filter(
    (mode) => bookingModes[mode.value] === true,
  );
}, [
  parkingQuery.data?.data?.parking?.bookingModes,
]);

  /*
   * EFFECTIVE MODE
   */

  const effectiveBookingMode = availableModes.some(
    (mode) => mode.value === bookingMode,
  )
    ? bookingMode
    : availableModes[0]?.value;

  /*
   * VEHICLES
   */

  const vehicles: Vehicle[] = vehiclesQuery.data?.data ?? [];

  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);

  /*
   * DURATION LIMITS
   */

  const durationLimits = useMemo(() => {
    switch (effectiveBookingMode) {
      case "hourly":
        return {
          min: 1,
          max: 24,
          unit: "hour",
        };

      case "daily":
        return {
          min: 1,
          max: 30,
          unit: "day",
        };

      case "monthly":
        return {
          min: 1,
          max: 12,
          unit: "month",
        };

      default:
        return {
          min: 1,
          max: 1,
          unit: "unit",
        };
    }
  }, [effectiveBookingMode]);

  /*
   * RESET DURATION WHEN MODE CHANGES
   *
   * This happens through the click handler below,
   * not synchronously inside an effect.
   */

  const handleBookingModeChange = (mode: BookingMode) => {
    setBookingMode(mode);
    setDuration(1);
    setError("");
  };

  /*
   * CALCULATE END TIME
   */

  const calculateEndDate = (
    start: Date,
    mode: BookingMode,
    value: number,
  ): Date => {
    const end = new Date(start);

    if (mode === "hourly") {
      end.setHours(end.getHours() + value);
    }

    if (mode === "daily") {
      end.setDate(end.getDate() + value);
    }

    if (mode === "monthly") {
      end.setMonth(end.getMonth() + value);
    }

    return end;
  };

  /*
   * PREVIEW DATES
   */

  const bookingPreview = useMemo(() => {
    if (bookingTiming === "future" && !futureStartTime) {
      return null;
    }

    const start = bookingTiming === "now" ? null : new Date(futureStartTime);

    if (
      bookingTiming === "future" &&
      (!start || Number.isNaN(start.getTime()))
    ) {
      return null;
    }

    /*
     * For "Book Now", we intentionally don't create
     * a Date during render. The actual start time is
     * generated during submit.
     */

    if (bookingTiming === "now") {
      return null;
    }

    const end = calculateEndDate(
      start as Date,
      effectiveBookingMode as BookingMode,
      duration,
    );

    return {
      start: start as Date,
      end,
    };
  }, [bookingTiming, futureStartTime, effectiveBookingMode, duration]);

  /*
   * CREATE BOOKING
   */

  const bookingMutation = useMutation({
    mutationFn: createBooking,

    onSuccess: (response) => {
      const booking = response.data?.booking;

      const payment = response.data?.payment;

      if (!booking?._id) {
        setError("Booking was created but no booking ID was returned.");

        return;
      }

      if (!payment?.orderId) {
        setError("Payment order was not created.");

        return;
      }

      sessionStorage.setItem(
        `slotgo-payment-${booking._id}`,
        JSON.stringify({
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
        }),
      );

      router.push(`/driver/bookings/${booking._id}/payment`);
    },

    onError: (mutationError: unknown) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  /*
   * VALIDATE BOOKING
   */

  const validateBooking = (): {
    start: Date;
    end: Date;
  } | null => {
    if (!vehicleId) {
      setError("Please select a vehicle.");

      return null;
    }

    if (!effectiveBookingMode) {
      setError("No booking mode is available for this parking.");

      return null;
    }

    if (
      !Number.isInteger(duration) ||
      duration < durationLimits.min ||
      duration > durationLimits.max
    ) {
      setError(
        `Duration must be between ${durationLimits.min} and ${durationLimits.max} ${durationLimits.unit}s.`,
      );

      return null;
    }

    let start: Date;

    /*
     * BOOK NOW
     */

    if (bookingTiming === "now") {
      start = new Date();
    } else {
      /*
       * FUTURE
       */

      if (!futureStartTime) {
        setError("Please select a future start date and time.");

        return null;
      }

      start = new Date(futureStartTime);

      if (Number.isNaN(start.getTime())) {
        setError("Please select a valid start date and time.");

        return null;
      }
    }

    const currentTime = new Date();

    /*
     * Never allow a past start time.
     */

    if (
      bookingTiming === "future" &&
      start.getTime() <= currentTime.getTime()
    ) {
      setError("Future bookings must start in the future.");

      return null;
    }

    const end = calculateEndDate(start, effectiveBookingMode, duration);

    if (end.getTime() <= start.getTime()) {
      setError("End time must be after start time.");

      return null;
    }

    return {
      start,
      end,
    };
  };

  /*
   * SUBMIT
   */

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const result = validateBooking();

    if (!result) {
      return;
    }

    bookingMutation.mutate({
      parkingId,
      vehicleId,
      bookingMode: effectiveBookingMode as BookingMode,
      startTime: result.start.toISOString(),
      endTime: result.end.toISOString(),
    });
  };

  /*
   * LOADING
   */

  if (parkingQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading booking information...</p>
      </main>
    );
  }

  /*
   * PARKING ERROR
   */

  if (parkingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(parkingQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * VEHICLE ERROR
   */

  if (vehiclesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(vehiclesQuery.error)}
        onBack={() => router.push("/driver/vehicles")}
      />
    );
  }

  const parking = parkingQuery.data?.data?.parking;

  if (!parking) {
    return (
      <ErrorState
        message="Parking location not found."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  /*
   * PAGE
   */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/driver/parkings/${parkingId}`)}
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to parking
          </button>

          <h1 className="text-3xl font-bold">Book Parking</h1>

          <p className="mt-2 text-slate-400">
            Reserve a parking slot at{" "}
            <span className="text-white">{parking.parkingName}</span>
          </p>

          <p className="mt-1 text-sm text-slate-500">{parking.address}</p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* VEHICLE */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Select Vehicle</h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose the vehicle you want to park.
            </p>

            {activeVehicles.length === 0 ? (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-300">
                  You don`t have an active vehicle.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/driver/vehicles/add")}
                  className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {activeVehicles.map((vehicle) => {
                  const selected = vehicleId === vehicle._id;

                  return (
                    <button
                      type="button"
                      key={vehicle._id}
                      onClick={() => setVehicleId(vehicle._id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {vehicle.brand} {vehicle.vehicleModel}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {vehicle.registrationNumber}
                          </p>
                        </div>

                        <span className="rounded-md bg-white/10 px-2 py-1 text-xs capitalize text-slate-300">
                          {vehicle.vehicleType}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* BOOKING TIMING */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">When do you want to park?</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setBookingTiming("now");
                  setFutureStartTime("");
                  setError("");
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  bookingTiming === "now"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <p className="font-semibold">Book Now</p>

                <p className="mt-1 text-sm text-slate-400">
                  Start your parking from now.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingTiming("future");
                  setError("");
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  bookingTiming === "future"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <p className="font-semibold">Book for Later</p>

                <p className="mt-1 text-sm text-slate-400">
                  Select a future date and time.
                </p>
              </button>
            </div>

            {bookingTiming === "future" && (
              <div className="mt-5">
                <label
                  htmlFor="futureStartTime"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Start date and time
                </label>

                <input
                  id="futureStartTime"
                  type="datetime-local"
                  value={futureStartTime}
                  min={minimumDateTime}
                  onChange={(event) => setFutureStartTime(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  You can only select a future date and time.
                </p>
              </div>
            )}
          </section>

          {/* BOOKING TYPE */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Booking Type</h2>

            {availableModes.length === 0 ? (
              <p className="mt-4 text-sm text-red-300">
                This parking does not currently support booking.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {availableModes.map((mode) => {
                  const selected = effectiveBookingMode === mode.value;

                  return (
                    <button
                      type="button"
                      key={mode.value}
                      onClick={() => handleBookingModeChange(mode.value)}
                      className={`rounded-xl border px-4 py-4 text-center transition ${
                        selected
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <span className="block font-medium">{mode.label}</span>

                      <span className="mt-1 block text-xs text-slate-500">
                        {mode.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* DURATION */}

          {effectiveBookingMode && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Duration</h2>

              <p className="mt-1 text-sm text-slate-400">
                Choose how long you want to park.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 p-4">
                <button
                  type="button"
                  onClick={() =>
                    setDuration(Math.max(durationLimits.min, duration - 1))
                  }
                  disabled={duration <= durationLimits.min}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <div className="text-center">
                  <p className="text-3xl font-bold">{duration}</p>

                  <p className="mt-1 text-sm capitalize text-slate-400">
                    {durationLimits.unit}
                    {duration === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDuration(Math.min(durationLimits.max, duration + 1))
                  }
                  disabled={duration >= durationLimits.max}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Maximum {durationLimits.max} {durationLimits.unit}s per booking.
              </p>
            </section>
          )}

          {/* BOOKING PREVIEW */}

          {bookingPreview && (
            <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Booking Summary</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Start</p>

                  <p className="mt-1 text-sm text-white">
                    {formatDate(bookingPreview.start)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">End</p>

                  <p className="mt-1 text-sm text-white">
                    {formatDate(bookingPreview.end)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/[0.04] p-3 text-xs text-slate-400">
                Your parking duration is{" "}
                <span className="font-semibold text-white">
                  {duration} {durationLimits.unit}
                  {duration === 1 ? "" : "s"}
                </span>
                .
              </div>
            </section>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              bookingMutation.isPending ||
              activeVehicles.length === 0 ||
              !effectiveBookingMode
            }
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingMutation.isPending
              ? "Creating Booking..."
              : "Continue to Payment"}
          </button>
        </form>
      </div>
    </main>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({ message, onBack }: ErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <h1 className="text-xl font-semibold">
          Unable to load booking information
        </h1>

        <p className="mt-2 text-sm text-red-300">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Go back
        </button>
      </div>
    </main>
  );
}
