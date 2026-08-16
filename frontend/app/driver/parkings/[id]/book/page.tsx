"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getParking,
} from "@/services/parking.service";

import {
  getMyVehicles,
} from "@/services/vehicle.service";

import {
  createBooking,
} from "@/services/booking.service";

import {
  getApiErrorMessage,
} from "@/lib/api-error";

import type {
  BookingMode,
} from "@/types/booking";

import type {
  Vehicle,
} from "@/types/vehicle";

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

  const parkingId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [vehicleId, setVehicleId] =
    useState("");

  const [bookingMode, setBookingMode] =
    useState<BookingMode>("hourly");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ----------------------------------------------------------
   * PARKING
   * ----------------------------------------------------------
   */

  const parkingQuery = useQuery({
    queryKey: [
      "parking",
      parkingId,
    ],

    queryFn: () =>
      getParking(parkingId),

    enabled:
      parkingId.length > 0,
  });

  /*
   * ----------------------------------------------------------
   * VEHICLES
   * ----------------------------------------------------------
   */

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],

    queryFn: () =>
      getMyVehicles(),
  });

  /*
   * ----------------------------------------------------------
   * AVAILABLE BOOKING MODES
   * ----------------------------------------------------------
   */

  const availableModes =
    useMemo(() => {
      const parking =
        parkingQuery.data?.data;

      if (!parking) {
        return [];
      }

      return [
        {
          value:
            "hourly" as const,
          label: "Hourly",
          enabled:
            parking.bookingModes.hourly,
        },
        {
          value:
            "daily" as const,
          label: "Daily",
          enabled:
            parking.bookingModes.daily,
        },
        {
          value:
            "monthly" as const,
          label: "Monthly",
          enabled:
            parking.bookingModes.monthly,
        },
      ].filter(
        (mode) => mode.enabled,
      );
    }, [parkingQuery.data]);

  /*
   * ----------------------------------------------------------
   * EFFECTIVE BOOKING MODE
   * ----------------------------------------------------------
   *
   * We do NOT call setBookingMode() from an effect.
   *
   * If the selected mode is unavailable, we simply use the
   * first available mode for the booking request/UI.
   */

  const effectiveBookingMode =
    availableModes.some(
      (mode) =>
        mode.value === bookingMode,
    )
      ? bookingMode
      : availableModes[0]?.value;

  /*
   * ----------------------------------------------------------
   * VEHICLES
   * ----------------------------------------------------------
   */

  const vehicles: Vehicle[] =
    vehiclesQuery.data?.data ?? [];

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.isActive,
    );

  /*
   * ----------------------------------------------------------
   * CREATE BOOKING
   * ----------------------------------------------------------
   */

  const bookingMutation =
    useMutation({
      mutationFn: createBooking,

      onSuccess: (response) => {
        const booking =
          response.data?.booking;

        if (!booking?._id) {
          setError(
            "Booking was created but no booking ID was returned.",
          );

          return;
        }

        router.push(
          `/driver/bookings/${booking._id}/payment`,
        );
      },

      onError: (
        mutationError: unknown,
      ) => {
        setError(
          getApiErrorMessage(
            mutationError,
          ),
        );
      },
    });

  /*
   * ----------------------------------------------------------
   * VALIDATE TIME
   * ----------------------------------------------------------
   */

  const validateTimes = (): string | null => {
    if (!startTime || !endTime) {
      return "Please select both start and end time.";
    }

    const start =
      new Date(startTime);

    const end =
      new Date(endTime);

    if (
      Number.isNaN(
        start.getTime(),
      ) ||
      Number.isNaN(
        end.getTime(),
      )
    ) {
      return "Invalid date or time.";
    }

    if (start >= end) {
      return "End time must be after start time.";
    }

    if (
      start.getTime() <
      Date.now()
    ) {
      return "Booking start time cannot be in the past.";
    }

    const durationMs =
      end.getTime() -
      start.getTime();

    const durationHours =
      durationMs /
      (1000 * 60 * 60);

    if (
      effectiveBookingMode ===
      "hourly"
    ) {
      if (durationHours < 1) {
        return "Hourly booking must be at least 1 hour.";
      }

      if (
        !Number.isInteger(
          durationHours,
        )
      ) {
        return "Hourly booking must use whole hours.";
      }
    }

    if (
      effectiveBookingMode ===
      "daily"
    ) {
      if (durationHours < 24) {
        return "Daily booking must be at least 24 hours.";
      }

      if (
        durationHours % 24 !==
        0
      ) {
        return "Daily booking must use complete days.";
      }
    }

    if (
      effectiveBookingMode ===
      "monthly"
    ) {
      if (
        durationHours <
        24 * 28
      ) {
        return "Monthly booking must be at least 28 days.";
      }
    }

    return null;
  };

  /*
   * ----------------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------------
   */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!vehicleId) {
      setError(
        "Please select a vehicle.",
      );

      return;
    }

    if (!effectiveBookingMode) {
      setError(
        "No booking mode is available for this parking.",
      );

      return;
    }

    const timeError =
      validateTimes();

    if (timeError) {
      setError(timeError);

      return;
    }

    bookingMutation.mutate({
      parkingId,
      vehicleId,
      bookingMode:
        effectiveBookingMode,
      startTime:
        new Date(
          startTime,
        ).toISOString(),
      endTime:
        new Date(
          endTime,
        ).toISOString(),
    });
  };

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (
    parkingQuery.isLoading ||
    vehiclesQuery.isLoading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading booking information...
        </p>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * PARKING ERROR
   * ----------------------------------------------------------
   */

  if (parkingQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          parkingQuery.error,
        )}
        onBack={() =>
          router.push(
            "/driver/parkings",
          )
        }
      />
    );
  }

  /*
   * ----------------------------------------------------------
   * VEHICLE ERROR
   * ----------------------------------------------------------
   */

  if (vehiclesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          vehiclesQuery.error,
        )}
        onBack={() =>
          router.push(
            "/driver/vehicles",
          )
        }
      />
    );
  }

  const parking =
    parkingQuery.data?.data;

  if (!parking) {
    return (
      <ErrorState
        message="Parking location not found."
        onBack={() =>
          router.push(
            "/driver/parkings",
          )
        }
      />
    );
  }

  /*
   * ----------------------------------------------------------
   * PAGE
   * ----------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/driver/parkings/${parkingId}`,
              )
            }
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to parking
          </button>

          <h1 className="text-3xl font-bold">
            Book Parking
          </h1>

          <p className="mt-2 text-slate-400">
            Reserve a parking slot at{" "}
            <span className="text-white">
              {parking.parkingName}
            </span>
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {parking.address}
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Vehicle */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Select Vehicle
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose the vehicle you want to park.
            </p>

            {activeVehicles.length ===
            0 ? (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-300">
                  You don`t have an active vehicle.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/driver/vehicles/add",
                    )
                  }
                  className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {activeVehicles.map(
                  (vehicle) => {
                    const selected =
                      vehicleId ===
                      vehicle._id;

                    return (
                      <button
                        type="button"
                        key={
                          vehicle._id
                        }
                        onClick={() =>
                          setVehicleId(
                            vehicle._id,
                          )
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {
                                vehicle.brand
                              }{" "}
                              {
                                vehicle.vehicleModel
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {
                                vehicle.registrationNumber
                              }
                            </p>
                          </div>

                          <span className="rounded-md bg-white/10 px-2 py-1 text-xs capitalize text-slate-300">
                            {
                              vehicle.vehicleType
                            }
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* Booking Mode */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Booking Type
            </h2>

            {availableModes.length ===
            0 ? (
              <p className="mt-4 text-sm text-red-300">
                This parking does not currently
                support booking.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {availableModes.map(
                  (mode) => {
                    const selected =
                      effectiveBookingMode ===
                      mode.value;

                    return (
                      <button
                        type="button"
                        key={
                          mode.value
                        }
                        onClick={() =>
                          setBookingMode(
                            mode.value,
                          )
                        }
                        className={`rounded-xl border px-4 py-4 text-center transition ${
                          selected
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <span className="block font-medium">
                          {
                            mode.label
                          }
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {mode.value ===
                            "hourly" &&
                            "Whole hours"}

                          {mode.value ===
                            "daily" &&
                            "Complete days"}

                          {mode.value ===
                            "monthly" &&
                            "Minimum 28 days"}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* Duration */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-lg font-semibold">
              Parking Duration
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Start time
                </label>

                <input
                  id="startTime"
                  type="datetime-local"
                  value={
                    startTime
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartTime(
                      event.target
                        .value,
                    )
                  }
                  min={new Date()
                    .toISOString()
                    .slice(
                      0,
                      16,
                    )}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="mb-2 block text-sm text-slate-300"
                >
                  End time
                </label>

                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(
                    event,
                  ) =>
                    setEndTime(
                      event.target
                        .value,
                    )
                  }
                  min={
                    startTime ||
                    new Date()
                      .toISOString()
                      .slice(
                        0,
                        16,
                      )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-white/[0.03] p-3 text-xs text-slate-400">
              {effectiveBookingMode ===
                "hourly" &&
                "Hourly bookings must be at least 1 hour and use whole-hour durations."}

              {effectiveBookingMode ===
                "daily" &&
                "Daily bookings must be at least 24 hours and use complete days."}

              {effectiveBookingMode ===
                "monthly" &&
                "Monthly bookings must be at least 28 days."}
            </div>
          </section>

          {/* Submit */}

          <button
            type="submit"
            disabled={
              bookingMutation.isPending ||
              activeVehicles.length ===
                0 ||
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
          Unable to load booking information
        </h1>

        <p className="mt-2 text-sm text-red-300">
          {message}
        </p>

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