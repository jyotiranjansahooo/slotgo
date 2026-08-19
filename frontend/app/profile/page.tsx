"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  LogOut,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  /*
   * SlotGo theme background
   * Alternates:
   * #565AF4
   * #4F52F4
   */
  const themeBackground = {
    backgroundImage:
      "repeating-linear-gradient(90deg, #565AF4 0px, #565AF4 92px, #4F52F4 92px, #4F52F4 184px)",
  };

  if (isLoading) {
    return (
      <main
        className="relative min-h-screen overflow-hidden text-white"
        style={themeBackground}
      >
        {/* ===================================================== */}
        {/* BACKGROUND BUBBLES */}
        {/* ===================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-left bubble */}
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />

          {/* Top-right bubble */}
          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-indigo-300/20 blur-3xl" />

          {/* Center bubble */}
          <div className="absolute left-[35%] top-[35%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />

          {/* Bottom-left bubble */}
          <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-purple-300/10 blur-3xl" />

          {/* Bottom-right bubble */}
          <div className="absolute -bottom-32 -right-20 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10">
          {/* navbar + page content go here */}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-white"
        style={themeBackground}
      >
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#4F52F4] shadow-lg">
            <User size={28} />
          </div>

          <h1 className="mt-6 text-2xl font-bold">You&apos;re not signed in</h1>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Please login to view your SlotGo profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#4F52F4] shadow-lg transition hover:bg-white/90"
          >
            Login
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "SlotGo User";

  const roleLabel =
    user.role === "parkingOwner"
      ? "Parking Owner"
      : user.role === "driver"
        ? "Driver"
        : user.role === "admin"
          ? "Administrator"
          : user.role;

  return (
    <main className="min-h-screen text-white" style={themeBackground}>
      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

<header className="relative z-20 border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4F52F4] shadow-lg">
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
              className="hidden rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-md transition hover:bg-white/20 sm:flex"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#4F52F4] shadow-lg transition hover:bg-white/90"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        {/* =================================================== */}
        {/* PROFILE HERO */}
        {/* =================================================== */}

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="relative overflow-hidden px-7 py-9 sm:px-10 sm:py-12">
            {/* Decorative glow */}

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-300/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              {/* USER INFO */}

              <div className="flex items-center gap-5">
                {/* AVATAR */}

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-white text-3xl font-bold text-[#4F52F4] shadow-xl sm:h-24 sm:w-24 sm:text-4xl">
                  {fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                  {/* ROLE */}

                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                    {roleLabel}
                  </div>

                  {/* NAME */}

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {fullName}
                  </h1>

                  <p className="mt-2 text-sm text-white/60">
                    Manage your SlotGo account and personal information.
                  </p>
                </div>
              </div>

              {/* VERIFIED */}

              <div className="flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 size={18} />
                Account verified
              </div>
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* PROFILE INFORMATION */}
        {/* =================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          {/* PERSONAL INFORMATION */}

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-medium text-white/50">
                Personal information
              </p>

              <h2 className="mt-1 text-2xl font-bold">Account details</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField
                icon={<User size={19} />}
                label="First name"
                value={user.firstName || "Not provided"}
              />

              <ProfileField
                icon={<User size={19} />}
                label="Last name"
                value={user.lastName || "Not provided"}
              />

              <ProfileField
                icon={<Mail size={19} />}
                label="Email address"
                value={user.email}
              />

              <ProfileField
                icon={<Phone size={19} />}
                label="Phone number"
                value={user.phoneNumber || "Not provided"}
              />

              <ProfileField
                icon={<ShieldCheck size={19} />}
                label="Account type"
                value={roleLabel}
              />

              <ProfileField
                icon={<MapPin size={19} />}
                label="Account status"
                value="Active"
              />
            </div>
          </div>

          {/* ACCOUNT SECURITY */}

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-6 text-xl font-bold">Your account is secure</h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Your email has been verified and your SlotGo account is active.
            </p>

            <div className="mt-7 space-y-3">
              <StatusItem label="Email verified" active />

              <StatusItem label="Account active" active />

              <StatusItem label="Secure authentication" active />
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* QUICK LINKS */}
        {/* =================================================== */}

        <div className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-medium text-white/50">
              Account shortcuts
            </p>

            <h2 className="mt-1 text-2xl font-bold">Manage your SlotGo</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <ProfileAction
              href="/vehicles"
              icon={<Car size={22} />}
              title="My Vehicles"
              description="Manage your registered vehicles."
            />

            <ProfileAction
              href="/bookings"
              icon={<CalendarDays size={22} />}
              title="My Bookings"
              description="View your current and past bookings."
            />

            <ProfileAction
              href="/parking"
              icon={<MapPin size={22} />}
              title="Find Parking"
              description="Search and reserve nearby parking."
            />
          </div>
        </div>

        {/* =================================================== */}
        {/* LOGOUT */}
        {/* =================================================== */}

        <div className="mt-12 rounded-[2rem] border border-red-200/10 bg-red-400/5 p-7 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Sign out of SlotGo</h3>

              <p className="mt-1 text-sm text-white/50">
                You can sign back in anytime using your account credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================= */
/* PROFILE FIELD */
/* ============================================================= */

interface ProfileFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:bg-black/15">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* STATUS ITEM */
/* ============================================================= */

interface StatusItemProps {
  label: string;
  active?: boolean;
}

function StatusItem({ label, active = false }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>

      <CheckCircle2
        size={18}
        className={active ? "text-emerald-300" : "text-white/30"}
      />
    </div>
  );
}

interface ProfileActionProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

function ProfileAction({ href, icon, title, description }: ProfileActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-white/40 transition group-hover:translate-x-1 group-hover:text-white"
        />
      </div>

      <h3 className="mt-6 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
    </Link>
  );
}
