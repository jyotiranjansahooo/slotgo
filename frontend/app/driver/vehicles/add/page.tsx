"use client";

import { useState } from "react";
import { ArrowLeft, Car, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicle/VehicleForm";

import { createVehicle } from "@/services/vehicle.service";
import { getApiErrorMessage } from "@/lib/api-error";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import type { CreateVehicleData } from "@/types/vehicle";

export default function AddVehiclePage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <AddVehicle />
    </ProtectedRoute>
  );
}

function AddVehicle() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: CreateVehicleData) => {
    try {
      setIsSubmitting(true);
      setError("");

      await createVehicle(data);

      router.push("/driver/vehicles");
      router.refresh();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061c19] text-white">
      {/* =========================================================
          VERTICAL STRIPE BACKGROUND
         ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Vertical stripes */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(45,212,191,0.045) 0px, rgba(45,212,191,0.045) 1px, transparent 1px, transparent 72px)",
          }}
        />

        {/* Secondary fine stripes */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 35px, rgba(255,255,255,0.025) 35px, rgba(255,255,255,0.025) 36px)",
          }}
        />

        {/* Top glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[120px]" />

        {/* Right glow */}
        <div className="absolute -right-40 top-1/4 h-[450px] w-[450px] rounded-full bg-cyan-400/10 blur-[120px]" />

        {/* Bottom glow */}
        <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-2 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

        <div className="mb-8 max-w-2xl">
          

          <div className="flex mt-6 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-950/30">
              <Car className="h-7 w-7 text-emerald-300" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Add a vehicle
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                Register your vehicle with SlotGo so you can quickly select it
                when making a parking booking.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            MAIN GRID
           ======================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* =====================================================
              FORM CARD
             ===================================================== */}

          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 backdrop-blur-2xl">
            {/* Card header */}
            <div className="border-b border-white/10 bg-white/[0.025] px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                    Vehicle details
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Enter your vehicle information
                  </h2>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 sm:flex">
                  <Car className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-7 sm:px-8 sm:py-9">
              {/* Error */}
              {error && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
                    <span className="text-sm font-bold text-red-300">!</span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-200">
                      Unable to add vehicle
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-300/70">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <VehicleForm
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => router.push("/driver/vehicles")}
              />
            </div>
          </section>

          {/* =====================================================
              SIDEBAR
             ===================================================== */}

          <aside className="space-y-5">
            {/* Security card */}
            <div className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/[0.06] p-6 backdrop-blur-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Your information is secure
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Vehicle information is securely associated with your driver
                account and is used for parking bookings.
              </p>
            </div>

            {/* Tips card */}
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">
                Quick tips
              </p>

              <div className="mt-5 space-y-4">
                <Tip
                  number="01"
                  text="Enter the registration number exactly as shown on your vehicle."
                />

                <Tip
                  number="02"
                  text="Use the correct vehicle type so parking availability is accurate."
                />

                <Tip
                  number="03"
                  text="You can edit or remove your vehicle later."
                />
              </div>
            </div>

            {/* Visual accent */}
            <div className="relative hidden overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 p-6 lg:block">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />

                  <span className="text-xs font-medium">
                    SlotGo driver account
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/45">
                  Once added, your vehicle will be available when you create a
                  parking booking.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Tip({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-semibold text-emerald-300">
        {number}
      </span>

      <p className="text-sm leading-5 text-white/50">{text}</p>
    </div>
  );
}
