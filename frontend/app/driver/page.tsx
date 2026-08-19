"use client";

import Link from "next/link";
import {
  ArrowRight,
  Car,
  CalendarDays,
  MapPin,
  User,
  Clock3,
  CreditCard,
  ShieldCheck,
  Navigation,
  ParkingCircle,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
// import Footer from "@/components/home/Footer";

export default function DriverPage() {
  const { user } = useAuth();

  const firstName = user?.firstName || "Driver";
  return (
    <main className="min-h-screen bg-[#4f46f5] text-white">
      <header className="border-b border-white/10 bg-[#4f46f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4f46f5] shadow-lg">
              <MapPin size={23} strokeWidth={2.5} />
            </div>

            <span className="text-xl font-bold tracking-tight">SlotGo</span>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Find Parking
            </Link>

            <Link
              href="/bookings"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              My Bookings
            </Link>

            <Link
              href="/how-it-works"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              How It Works
            </Link>
          </nav>

          {/* ACTIONS */}

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-md transition hover:bg-white/20 sm:block"
            >
              Home
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#4f46f5] shadow-lg transition hover:bg-white/90"
            >
              <User size={17} />
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {/* =================================================== */}
        {/* WELCOME HERO */}
        {/* =================================================== */}

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/15 via-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-xl lg:p-12">
          {/* Decorative circles */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-300/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Driver Dashboard
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Welcome back,
                <br />
                <span className="text-white/70">{firstName}.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Find nearby parking, manage your vehicles, and keep track of all
                your bookings from one simple place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/parking"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#4f46f5] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  <ParkingCircle size={19} />
                  Find Parking
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/bookings"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  <CalendarDays size={18} />
                  My Bookings
                </Link>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="relative hidden lg:block">
              <div className="relative mx-auto h-72 w-72 rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                <div className="absolute inset-8 rounded-full border border-dashed border-white/20" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-[#4f46f5] shadow-2xl">
                    <Navigation size={38} strokeWidth={2} />
                  </div>
                </div>

                <div className="absolute left-8 top-16 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4f46f5] shadow-xl">
                  <MapPin size={18} />
                </div>

                <div className="absolute bottom-12 right-8 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4f46f5] shadow-xl">
                  <ParkingCircle size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* STATS */}
        {/* =================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            icon={<Car size={20} />}
            label="Vehicles"
            value="0"
            description="Registered vehicles"
            href="/vehicles"
          />

          <DashboardStat
            icon={<CalendarDays size={20} />}
            label="Bookings"
            value="0"
            description="Active bookings"
            href="/bookings"
          />

          <DashboardStat
            icon={<Clock3 size={20} />}
            label="Parking"
            value="—"
            description="Current session"
            href="/parking"
          />

          <DashboardStat
            icon={<CreditCard size={20} />}
            label="Payments"
            value="₹0"
            description="This month"
            href="/payments"
          />
        </div>

        {/* =================================================== */}
        {/* QUICK ACTIONS */}
        {/* =================================================== */}

        <div className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-medium text-white/60">Quick actions</p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              What would you like to do?
            </h2>

            <p className="mt-2 text-white/60">
              Everything you need for a smoother parking experience.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              icon={<ParkingCircle size={23} />}
              title="Find Parking"
              description="Discover nearby parking spaces, check availability, and reserve your spot."
              button="Explore parking"
              href="/parking"
              primary
            />

            <ActionCard
              icon={<Car size={23} />}
              title="Manage Vehicles"
              description="Add vehicles, update vehicle information, and manage your registered vehicles."
              button="Manage vehicles"
              href="/vehicles"
            />

            <ActionCard
              icon={<CalendarDays size={23} />}
              title="My Bookings"
              description="View upcoming bookings, payment status, parking history, and active sessions."
              button="View bookings"
              href="/bookings"
            />
          </div>
        </div>

        {/* =================================================== */}
        {/* ACCOUNT / SECURITY */}
        {/* =================================================== */}

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-7 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <User size={21} />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Your account</h3>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  Manage your personal information, vehicles, and account
                  preferences.
                </p>

                <Link
                  href="/profile"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                >
                  Manage profile
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-7 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Secure parking</h3>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  Your bookings and account information are protected by
                  SlotGo&apos;s secure authentication system.
                </p>

                <Link
                  href="/how-it-works"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                >
                  Learn more
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* BOTTOM CTA */}
        {/* =================================================== */}

        <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white p-8 text-[#4f46f5] shadow-2xl sm:p-10">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#4f46f5]/60">
                Need a parking spot?
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Find your parking space.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Search nearby parking locations and reserve your space before
                you arrive.
              </p>
            </div>

            <Link
              href="/parking"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4f46f5] px-7 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
            >
              Find Parking
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================= */
/* STAT CARD */
/* ============================================================= */

interface DashboardStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  href: string;
}

function DashboardStat({
  icon,
  label,
  value,
  description,
  href,
}: DashboardStatProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>

        <ArrowRight
          size={17}
          className="text-white/40 transition group-hover:translate-x-1 group-hover:text-white"
        />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-sm text-white/50">{description}</p>
    </Link>
  );
}

/* ============================================================= */
/* ACTION CARD */
/* ============================================================= */

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  href: string;
  primary?: boolean;
}

function ActionCard({
  icon,
  title,
  description,
  button,
  href,
  primary = false,
}: ActionCardProps) {
  return (
    <div
      className={`group rounded-[1.75rem] border p-7 backdrop-blur-xl transition hover:-translate-y-1 ${
        primary
          ? "border-white/20 bg-white text-[#4f46f5] shadow-2xl"
          : "border-white/10 bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary ? "bg-[#4f46f5]/10" : "bg-white/10"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold">{title}</h3>

      <p
        className={`mt-3 min-h-[72px] text-sm leading-6 ${
          primary ? "text-zinc-500" : "text-white/60"
        }`}
      >
        {description}
      </p>

      <Link
        href={href}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
          primary
            ? "bg-[#4f46f5] text-white hover:bg-[#4338ca]"
            : "border border-white/15 bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {button}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
