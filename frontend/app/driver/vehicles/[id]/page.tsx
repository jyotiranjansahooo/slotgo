"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Car,
  CalendarDays,
  Edit3,
  Hash,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Palette,
} from "lucide-react";

import api from "@/lib/api";

interface Vehicle {
  _id: string;

  registrationNumber: string;

  vehicleType: string;

  brand?: string;

  vehicleModel?: string;

  color?: string;

  isDefault?: boolean;

  createdAt?: string;
}

export default function VehicleDetailsPage() {
  const router = useRouter();

  const params = useParams();

  const vehicleId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [isLoading, setIsLoading] = useState(Boolean(vehicleId));

  const [error, setError] = useState<string | null>(
    vehicleId ? null : "Vehicle ID not found.",
  );

  useEffect(() => {
    if (!vehicleId) {
      return;
    }

    const fetchVehicle = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/vehicles/${vehicleId}`);

        console.log("Vehicle API response:", response.data);

        const responseData = response.data;

        const vehicleData = responseData.data;

        if (!vehicleData) {
          throw new Error("Vehicle data not found");
        }

        setVehicle(vehicleData);
      } catch (error: unknown) {
        console.error("Failed to fetch vehicle:", error);

        setError("Vehicle details could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVehicle();
  }, [vehicleId]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f7f3e8]">
        <Background />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black shadow-xl">
              <Loader2 size={28} className="animate-spin text-[#facc15]" />
            </div>

            <p className="mt-4 text-sm font-semibold text-black/60">
              Loading vehicle details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f7f3e8]">
        <Background />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-black">Something went wrong</h1>

            <p className="mt-2 text-sm leading-6 text-black/50">
              {error || "Vehicle details could not be loaded."}
            </p>

           
          </div>
        </div>
      </main>
    );
  }

  const vehicleName =
    [vehicle.brand, vehicle.vehicleModel].filter(Boolean).join(" ") ||
    vehicle.vehicleType;

  return (
    <main className="relative  min-h-screen overflow-hidden bg-[#b6ab8a] text-[#181818]">
      <Background />

      <div className="relative mt-16 z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
          <div className="relative overflow-hidden bg-black px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#facc15]/20 blur-3xl" />

            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-[#facc15] shadow-lg">
                  <Car size={36} strokeWidth={2.2} className="text-black" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#facc15]/70">
                    Your vehicle
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {vehicleName}
                  </h1>

                  <p className="mt-2 text-sm text-white/50">
                    Vehicle details and information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(`/driver/vehicles/${vehicleId}/edit`)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#facc15] px-5 text-sm font-black text-black transition hover:scale-[1.02]"
              >
                <Edit3 size={17} />
                Edit vehicle
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">
                  Vehicle information
                </p>

                <h2 className="mt-2 text-2xl font-black">Details</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={<Hash size={18} />}
                  label="Registration number"
                  value={vehicle.registrationNumber}
                />

                <DetailCard
                  icon={<Car size={18} />}
                  label="Vehicle type"
                  value={formatValue(vehicle.vehicleType)}
                />

                <DetailCard
                  icon={<ShieldCheck size={18} />}
                  label="Brand"
                  value={vehicle.brand || "Not specified"}
                />

                <DetailCard
                  icon={<Car size={18} />}
                  label="Model"
                  value={vehicle.vehicleModel || "Not specified"}
                />

                <DetailCard
                  icon={<Palette size={18} />}
                  label="Color"
                  value={vehicle.color || "Not specified"}
                />

                <DetailCard
                  icon={<Car size={18} />}
                  label="Default vehicle"
                  value={vehicle.isDefault ? "Yes" : "No"}
                />
              </div>
            </section>

            <aside className="rounded-[1.5rem] border border-black/10 bg-[#f7f3e8] p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#facc15] text-black">
                <CalendarDays size={20} />
              </div>

              <h3 className="mt-5 text-lg font-black">Vehicle status</h3>

              <div className="mt-4 rounded-xl border border-black/5 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                  </span>

                  <div>
                    <p className="text-sm font-bold">Active vehicle</p>

                    <p className="mt-0.5 text-xs text-black/45">
                      Ready to use for parking bookings
                    </p>
                  </div>
                </div>
              </div>

              {vehicle.createdAt && (
                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-black/35">
                    Added on
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {new Date(vehicle.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function Background() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#f7f3e8_0%,#f7f3e8_50%,#facc15_50%,#facc15_100%)] opacity-[0.08]" />

        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#facc15]/20 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #000 0px, #000 1px, transparent 1px, transparent 24px)",
        }}
      />
    </>
  );
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#faf9f5] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-[#facc15]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/35">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatValue(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
