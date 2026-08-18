"use client";

import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";

interface DriverHeaderProps {
  onMenuClick: () => void;
}

export default function DriverHeader({
  onMenuClick,
}: DriverHeaderProps) {
  const { user } = useAuth();

  const firstName = user?.firstName || "Driver";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile */}

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300"
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link
            href="/driver"
            className="font-bold text-white"
          >
            SlotGo
          </Link>
        </div>

        {/* Desktop */}

        <div className="hidden lg:block">
          <p className="text-sm text-slate-500">
            Driver Portal
          </p>

          <p className="text-sm font-medium text-white">
            Welcome back, {firstName}
          </p>
        </div>

        {/* Right */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Notifications"
          >
            ♧

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
          </button>

          <Link
            href="/driver/profile"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 transition hover:bg-white/[0.06]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <span className="hidden text-sm font-medium text-slate-200 sm:block">
              {firstName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}