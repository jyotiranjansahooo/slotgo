"use client";

import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <DriverDashboard />
    </ProtectedRoute>
  );
}

function DriverDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ============================================================
          PAGE CONTAINER
      ============================================================ */}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-10">
          {/* Background decoration */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Driver Dashboard
                </div>

                <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Welcome back to <span className="text-blue-400">SlotGo</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Find parking, manage your vehicles, and keep track of all your
                  parking bookings from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/driver/parkings")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:w-auto"
              >
                <ParkingIcon />
                Find Parking
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            QUICK STATS
        ============================================================ */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="My Vehicles"
            value="Manage"
            description="Registered vehicles"
            icon={<CarIcon />}
            onClick={() => router.push("/driver/vehicles")}
          />

          <DashboardStat
            label="Parking"
            value="Explore"
            description="Find available parking"
            icon={<ParkingIcon />}
            onClick={() => router.push("/driver/parkings")}
          />

          <DashboardStat
            label="Bookings"
            value="View"
            description="Current and past bookings"
            icon={<CalendarIcon />}
            onClick={() => router.push("/driver/bookings")}
          />

          <DashboardStat
            label="Account"
            value="Profile"
            description="Manage your account"
            icon={<UserIcon />}
            onClick={() => router.push("/driver/profile")}
          />
        </section>

        {/* ============================================================
            MAIN ACTIONS
        ============================================================ */}

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-blue-400">Quick actions</p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              What would you like to do?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access the most frequently used driver features.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              icon={<ParkingIcon />}
              title="Find Parking"
              description="Search for approved parking locations and check available parking options."
              buttonText="Explore parking"
              onClick={() => router.push("/driver/parkings")}
              primary
            />

            <ActionCard
              icon={<CarIcon />}
              title="Manage Vehicles"
              description="Add your vehicles, update vehicle information, and manage your active vehicles."
              buttonText="Manage vehicles"
              onClick={() => router.push("/driver/vehicles")}
            />

            <ActionCard
              icon={<CalendarIcon />}
              title="My Bookings"
              description="View your active bookings, payment status, booking history, and checkout information."
              buttonText="View bookings"
              onClick={() => router.push("/driver/bookings")}
            />
          </div>
        </section>

        {/* ============================================================
            BOOKING FLOW
        ============================================================ */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-400">
              How SlotGo works
            </p>

            <h2 className="text-2xl font-bold tracking-tight">
              Park in three simple steps
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StepCard
              number="01"
              icon={<CarIcon />}
              title="Add your vehicle"
              description="Register the vehicle you want to use for parking."
            />

            <StepCard
              number="02"
              icon={<ParkingIcon />}
              title="Choose parking"
              description="Find a suitable parking location and select your booking duration."
            />

            <StepCard
              number="03"
              icon={<PaymentIcon />}
              title="Book and pay"
              description="Confirm your booking, complete payment, and manage your parking session."
            />
          </div>
        </section>

        {/* ============================================================
            FOOTER ACTION
        ============================================================ */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Ready to find a parking spot?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search available parking locations and make your next booking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/driver/parkings")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
            >
              Start Booking
              <ArrowRightIcon />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ================================================================
   DASHBOARD STAT
================================================================ */

interface DashboardStatProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function DashboardStat({
  label,
  value,
  description,
  icon,
  onClick,
}: DashboardStatProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-blue-500/30 hover:bg-blue-500/[0.04]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-blue-400 transition group-hover:border-blue-500/20 group-hover:bg-blue-500/10">
          {icon}
        </div>

        <ArrowUpRightIcon />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">{value}</p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </button>
  );
}

/* ================================================================
   ACTION CARD
================================================================ */

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  primary?: boolean;
}

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  primary = false,
}: ActionCardProps) {
  return (
    <div
      className={`group rounded-3xl border p-6 transition ${
        primary
          ? "border-blue-500/20 bg-blue-500/[0.06] hover:border-blue-500/40"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary
            ? "bg-blue-500/10 text-blue-400"
            : "bg-white/[0.05] text-slate-300"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold">{title}</h3>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          primary
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "border border-white/10 bg-white/[0.05] text-white hover:bg-white/10"
        }`}
      >
        {buttonText}

        <ArrowRightIcon />
      </button>
    </div>
  );
}

/* ================================================================
   STEP CARD
================================================================ */

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function StepCard({ number, icon, title, description }: StepCardProps) {
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-400">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wider text-blue-400">
            {number}
          </p>

          <h3 className="mt-1 font-semibold">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ICONS
================================================================ */

function CarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5 17h14" />
      <path d="M6 17v2" />
      <path d="M18 17v2" />
      <path d="M4 17v-4l2-5h12l2 5v4" />
      <path d="M6 13h12" />
      <circle cx="7" cy="16" r="1" />
      <circle cx="17" cy="16" r="1" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h2" />
      <path d="M14 14h2" />
      <path d="M8 17h2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 text-slate-600 transition group-hover:text-blue-400"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
