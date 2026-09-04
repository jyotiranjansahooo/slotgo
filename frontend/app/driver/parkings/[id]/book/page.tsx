"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { getParkingDetails } from "@/services/parking.service";
import { getMyVehicles } from "@/services/vehicle.service";
import { createBookingCheckout } from "@/services/booking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { BookingMode } from "@/types/booking";
import type { Vehicle } from "@/types/vehicle";
import type { Parking } from "@/types/parking";

type BookingTiming = "now" | "future";

interface BookingModeOption {
  value: BookingMode;
  label: string;
  description: string;
}

interface BookingPreview {
  start: Date;
  end: Date;
}

interface PricePreview {
  rate: number;
  parkingAmount: number;
  discountAmount: number;
  actualAmount: number;
  driverServiceFee: number;
  driverPays: number;
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
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const parkingQuery = useQuery({
    queryKey: ["driver-parking", parkingId],
    queryFn: () => getParkingDetails(parkingId),
    enabled: parkingId.length > 0,
  });

  const parking: Parking | undefined = parkingQuery.data?.parking;

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => getMyVehicles(),
  });

  const vehicles: Vehicle[] = vehiclesQuery.data?.data ?? [];

  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);

  const selectedVehicle = activeVehicles.find(
    (vehicle) => vehicle._id === vehicleId,
  );

  const selectedVehicleType = selectedVehicle?.vehicleType;

  const bookingModes = parking?.bookingModes;

  const availableModes: BookingModeOption[] = [
    {
      value: "hourly" as BookingMode,
      label: "Hourly",
      description: "Choose number of hours",
    },
    {
      value: "daily" as BookingMode,
      label: "Daily",
      description: "Choose number of days",
    },
    {
      value: "monthly" as BookingMode,
      label: "Monthly",
      description: "Choose number of months",
    },
  ].filter((mode) => {
    if (!bookingModes) {
      return false;
    }

    return bookingModes[mode.value] === true;
  });

  const effectiveBookingMode = availableModes.some(
    (mode) => mode.value === bookingMode,
  )
    ? bookingMode
    : availableModes[0]?.value;

  let durationLimits: {
    min: number;
    max: number;
    unit: string;
  };

  switch (effectiveBookingMode) {
    case "hourly":
      durationLimits = {
        min: 1,
        max: 24,
        unit: "hour",
      };
      break;

    case "daily":
      durationLimits = {
        min: 1,
        max: 30,
        unit: "day",
      };
      break;

    case "monthly":
      durationLimits = {
        min: 1,
        max: 12,
        unit: "month",
      };
      break;

    default:
      durationLimits = {
        min: 1,
        max: 1,
        unit: "unit",
      };
      break;
  }

  let rate = 0;

  if (parking?.pricing && selectedVehicleType && effectiveBookingMode) {
    switch (selectedVehicleType) {
      case "twoWheeler":
        rate = parking.pricing.twoWheeler?.[effectiveBookingMode] ?? 0;
        break;

      case "fourWheeler":
        rate = parking.pricing.fourWheeler?.[effectiveBookingMode] ?? 0;
        break;

      case "vanMinibus":
        rate = parking.pricing.vanMinibus?.[effectiveBookingMode] ?? 0;
        break;

      case "heavyVehicle":
        rate = parking.pricing.heavyVehicle?.[effectiveBookingMode] ?? 0;
        break;
    }
  }

  let pricePreview: PricePreview | null = null;

  if (rate > 0) {
    const parkingAmount = rate * duration;
    const discountAmount = 0;

    const actualAmount = Math.max(0, parkingAmount - discountAmount);

    let driverServiceFee = Math.round(actualAmount * 0.05);

    driverServiceFee = Math.max(5, Math.min(driverServiceFee, 35));

    const driverPays = Number((actualAmount + driverServiceFee).toFixed(2));

    pricePreview = {
      rate,
      parkingAmount,
      discountAmount,
      actualAmount,
      driverServiceFee,
      driverPays,
    };
  }

  const handleBookingModeChange = (mode: BookingMode) => {
    setBookingMode(mode);
    setDuration(1);
    setError("");
  };

  const calculateEndDate = (
    start: Date,
    mode: BookingMode,
    value: number,
  ): Date => {
    const end = new Date(start);

    switch (mode) {
      case "hourly":
        end.setHours(end.getHours() + value);
        break;

      case "daily":
        end.setDate(end.getDate() + value);
        break;

      case "monthly":
        end.setMonth(end.getMonth() + value);
        break;
    }

    return end;
  };

  const getBookNowStartTime = (): Date => {
    return new Date(currentTime.getTime() + 60 * 1000);
  };

  const getFutureMinimumDateTime = (): string => {
    const minimum = new Date(currentTime.getTime() + 60 * 1000);

    const offset = minimum.getTimezoneOffset();

    const localDate = new Date(minimum.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  let bookingPreview: BookingPreview | null = null;

  if (effectiveBookingMode) {
    let start: Date | null = null;

    if (bookingTiming === "now") {
      start = getBookNowStartTime();
    } else if (futureStartTime) {
      const futureDate = new Date(futureStartTime);

      if (!Number.isNaN(futureDate.getTime())) {
        start = futureDate;
      }
    }

    if (start) {
      const end = calculateEndDate(start, effectiveBookingMode, duration);

      bookingPreview = {
        start,
        end,
      };
    }
  }

  const bookingCheckoutMutation = useMutation({
    mutationFn: createBookingCheckout,

    onSuccess: (response) => {
      const checkout = response.data?.checkout;
      const razorpayOrder = response.data?.razorpayOrder;

      if (!checkout?._id) {
        setError(
          "Booking checkout was created but no checkout ID was returned.",
        );
        return;
      }

      if (!razorpayOrder?.id) {
        setError("Payment order was not created.");
        return;
      }

      router.push(`/driver/checkout/${checkout._id}/payment`);
    },

    onError: (mutationError: unknown) => {
      setError(
        getApiErrorMessage(mutationError) ||
          "Unable to start payment checkout.",
      );
    },
  });

  const validateBooking = (): {
    start: Date;
    end: Date;
  } | null => {
    if (!parkingId) {
      setError("Parking location is missing.");
      return null;
    }

    if (!vehicleId) {
      setError("Please select a vehicle.");
      return null;
    }

    if (!selectedVehicle) {
      setError("Selected vehicle could not be found.");
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

    if (bookingTiming === "now") {
      start = new Date(Date.now() + 60 * 1000);
    } else {
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

    const validationNow = new Date();

    if (start.getTime() <= validationNow.getTime()) {
      setError("Booking start time must be in the future.");
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (bookingCheckoutMutation.isPending) {
      return;
    }

    setError("");

    const result = validateBooking();

    if (!result) {
      return;
    }

    if (!effectiveBookingMode) {
      setError("Booking mode is required.");
      return;
    }

    bookingCheckoutMutation.mutate({
      parkingId,
      vehicleId,
      bookingMode: effectiveBookingMode,
      startTime: result.start.toISOString(),
      endTime: result.end.toISOString(),
    });
  };

  if (parkingQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Loading booking information...
          </p>
        </div>
      </main>
    );
  }

  if (parkingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(parkingQuery.error)}
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  if (vehiclesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(vehiclesQuery.error)}
        onBack={() => router.push("/driver/vehicles")}
      />
    );
  }

  if (!parking) {
    return (
      <ErrorState
        message="Parking location not found."
        onBack={() => router.push("/driver/parkings")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Book Parking</h1>

          <p className="mt-2 text-slate-400">
            Reserve parking capacity at{" "}
            <span className="font-medium text-white">
              {parking.parkingName}
            </span>
          </p>

          <p className="mt-1 text-sm text-slate-500">{parking.address}</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Select Vehicle</h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose the vehicle you want to park.
            </p>

            {activeVehicles.length === 0 ? (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-300">
                  You don&apos;t have an active vehicle.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/driver/vehicles/add")}
                  className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
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
                      onClick={() => {
                        setVehicleId(vehicle._id);
                        setError("");
                      }}
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
                  Start your parking immediately.
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
                  min={getFutureMinimumDateTime()}
                  onChange={(event) => {
                    setFutureStartTime(event.target.value);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  You can only select a future date and time.
                </p>
              </div>
            )}
          </section>

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
                  aria-label="Decrease duration"
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
                  aria-label="Increase duration"
                >
                  +
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Maximum {durationLimits.max} {durationLimits.unit}s per booking.
              </p>
            </section>
          )}

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

          {pricePreview && (
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Price Summary</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parking</span>

                  <span className="text-white">
                    ₹{pricePreview.parkingAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service fee</span>

                  <span className="text-white">
                    ₹{pricePreview.driverServiceFee.toFixed(2)}
                  </span>
                </div>

                {pricePreview.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Discount</span>

                    <span className="text-green-400">
                      -₹
                      {pricePreview.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Total</span>

                    <span className="text-2xl font-bold text-emerald-400">
                      ₹{pricePreview.driverPays.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <button
            type="submit"
            disabled={
              bookingCheckoutMutation.isPending ||
              activeVehicles.length === 0 ||
              !effectiveBookingMode ||
              !pricePreview
            }
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingCheckoutMutation.isPending ? (
              <span className="flex items-center justify-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Preparing Payment...
              </span>
            ) : pricePreview ? (
              `Continue to Payment • ₹${pricePreview.driverPays.toFixed(2)}`
            ) : (
              "Continue to Payment"
            )}
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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          !
        </div>

        <h1 className="text-xl font-semibold">
          Unable to load booking information
        </h1>

        <p className="mt-2 text-sm text-red-300">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    </main>
  );
}
