"use client";

import {  useState, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  createParkingBookingBlock,
  deleteParkingBookingBlock,
  getParkingBookingBlocks,
  type ParkingBookingBlock,
} from "@/services/parking-booking-block.service";

import { getApiErrorMessage } from "@/lib/api-error";

export default function ParkingAvailabilityPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <ParkingAvailability />
    </ProtectedRoute>
  );
}

function ParkingAvailability() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const parkingId = typeof params.id === "string" ? params.id : "";

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [reason, setReason] = useState("");
  const [minimumDateTime, setMinimumDateTime] = useState("");
  const [error, setError] = useState("");

  const blocksQuery = useQuery({
    queryKey: ["parking-booking-blocks", parkingId],

    queryFn: () => getParkingBookingBlocks(parkingId),

    enabled: parkingId.length > 0,
  });
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
  const createMutation = useMutation({
    mutationFn: ({
      startTime,
      endTime,
      reason,
    }: {
      startTime: string;
      endTime: string;
      reason?: string;
    }) =>
      createParkingBookingBlock(parkingId, {
        startTime,
        endTime,
        reason,
      }),

    onSuccess: async () => {
      setError("");
      setCustomStart("");
      setCustomEnd("");
      setReason("");

      await queryClient.invalidateQueries({
        queryKey: ["parking-booking-blocks", parkingId],
      });
    },

    onError: (mutationError: unknown) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteParkingBookingBlock,

    onSuccess: async () => {
      setError("");

      await queryClient.invalidateQueries({
        queryKey: ["parking-booking-blocks", parkingId],
      });
    },

    onError: (mutationError: unknown) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  const blocks: ParkingBookingBlock[] = blocksQuery.data?.data ?? [];

  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    updateTime();

    const interval = window.setInterval(updateTime, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const activeBlocks =
    currentTime === null
      ? blocks
      : blocks.filter(
          (block) => new Date(block.endTime).getTime() > currentTime,
        );

  const createQuickPause = (durationHours: number) => {
    setError("");

    const start = new Date();

    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    createMutation.mutate({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reason: `Temporary booking pause for ${durationHours} hour${
        durationHours === 1 ? "" : "s"
      }`,
    });
  };

  const createTodayPause = () => {
    setError("");

    const start = new Date();

    const end = new Date(start);

    end.setHours(23, 59, 59, 999);

    createMutation.mutate({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reason: "New bookings paused for today",
    });
  };

  const handleCustomPause = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!customStart || !customEnd) {
      setError("Please select both start and end time.");

      return;
    }

    const start = new Date(customStart);
    const end = new Date(customEnd);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Invalid date or time.");

      return;
    }

    if (start < new Date()) {
      setError("Booking pause cannot start in the past.");

      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");

      return;
    }

    createMutation.mutate({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      reason: reason.trim() || "Temporary booking pause",
    });
  };

  if (blocksQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading availability...</p>
      </main>
    );
  }

  if (blocksQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(blocksQuery.error)}
        onBack={() => router.push("/owner/parkings")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push(`/owner/parkings/${parkingId}`)}
          className="mb-6 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to parking
        </button>

        <div className="mb-8">
          <p className="text-sm text-blue-400">Parking Availability</p>

          <h1 className="mt-1 text-3xl font-bold">Manage New Bookings</h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Temporarily stop new bookings when your parking is unavailable.
            Existing confirmed bookings will not be cancelled.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Quick Pause */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Pause New Bookings</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Choose how long you want to stop accepting new bookings from
            drivers.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => createQuickPause(1)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-left transition hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
            >
              <p className="font-semibold">1 Hour</p>

              <p className="mt-1 text-xs text-zinc-500">
                Stop new bookings for one hour
              </p>
            </button>

            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => createQuickPause(2)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-left transition hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
            >
              <p className="font-semibold">2 Hours</p>

              <p className="mt-1 text-xs text-zinc-500">
                Stop new bookings for two hours
              </p>
            </button>

            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => createQuickPause(4)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-left transition hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
            >
              <p className="font-semibold">4 Hours</p>

              <p className="mt-1 text-xs text-zinc-500">
                Stop new bookings for four hours
              </p>
            </button>

            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={createTodayPause}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-left transition hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
            >
              <p className="font-semibold">Today</p>

              <p className="mt-1 text-xs text-zinc-500">
                Stop new bookings until midnight
              </p>
            </button>
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h3 className="font-medium">Custom Pause</h3>

            <form onSubmit={handleCustomPause} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pauseStart"
                    className="mb-2 block text-sm text-zinc-300"
                  >
                    Start
                  </label>

                  <input
                    id="pauseStart"
                    type="datetime-local"
                    value={customStart}
                    min={minimumDateTime}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pauseEnd"
                    className="mb-2 block text-sm text-zinc-300"
                  >
                    End
                  </label>

                  <input
                    id="pauseEnd"
                    type="datetime-local"
                    value={customEnd}
                    min={customStart || minimumDateTime}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  Reason
                </label>

                <input
                  id="reason"
                  type="text"
                  value={reason}
                  maxLength={200}
                  placeholder="e.g. Maintenance"
                  onChange={(event) => setReason(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? "Pausing..." : "Pause New Bookings"}
              </button>
            </form>
          </div>
        </section>

        {/* Active pauses */}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Booking Pauses</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {activeBlocks.length} active or upcoming pause
                {activeBlocks.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {activeBlocks.length === 0 ? (
            <div className="mt-5 rounded-xl bg-zinc-950 p-6 text-center text-sm text-zinc-500">
              New bookings are currently open.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {activeBlocks.map((block) => (
                <div
                  key={block._id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">New bookings paused</p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {formatDate(block.startTime)} →{" "}
                      {formatDate(block.endTime)}
                    </p>

                    {block.reason && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {block.reason}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(block._id)}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Remove Pause
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm font-medium text-yellow-300">Important</p>

          <p className="mt-1 text-sm text-yellow-200/70">
            Pausing new bookings does not cancel or modify existing confirmed
            bookings. Drivers with existing bookings can still check in and
            check out normally.
          </p>
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

function ErrorState({ message, onBack }: ErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-red-900 bg-red-950/30 p-6">
        <h1 className="text-xl font-semibold">Unable to load availability</h1>

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
