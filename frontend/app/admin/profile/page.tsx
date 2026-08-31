"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { authStorage } from "@/lib/auth-storage";

export default function AdminProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminProfile />
    </ProtectedRoute>
  );
}

function AdminProfile() {
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);

  function handleLogout() {
    authStorage.clear();

    window.location.replace("/login");
  }

  async function copyEmail() {
    if (!user?.email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(user.email);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy email:", error);
    }
  }

  const firstName = user?.firstName?.trim() || "Admin";
  const lastName = user?.lastName?.trim() || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase()
    .trim();

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
      {/* ==========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.025) 75%, transparent 75%)",
            backgroundSize: "90px 90px",
          }}
        />

        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[150px]" />

        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-200/5 blur-[120px]" />
      </div>

      {/* ==========================================================
          NAVBAR
      ========================================================== */}

      <nav className="relative z-20 border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* BRAND */}

          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-[#06544E]">
              S
            </div>

            <span className="font-bold tracking-tight">SlotGo</span>

            <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 sm:block">
              Admin
            </span>
          </Link>

          {/* NAVIGATION */}

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-300/10 bg-red-400/10 px-3 text-red-100 transition hover:bg-red-400/20 sm:px-4"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden text-sm font-semibold sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-6">

        <div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Admin Profile
          </h1>

          <p className="pl-6 mt-0.5 text-sm leading-6 text-white/40">
            View your SlotGo administrator account information.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          {/* TOP */}

          <div className="relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* AVATAR */}

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-white text-2xl font-bold text-[#06544E] shadow-2xl">
                {initials || "A"}
              </div>

              {/* NAME */}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {firstName} {lastName}
                  </h2>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                </div>

                <p className="mt-2 text-sm text-white/40">
                  SlotGo Administrator
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================
              ACCOUNT STATUS
          ====================================================== */}

          <div className="border-t border-white/10 bg-white/[0.025] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              </div>

              <div>
                <p className="text-sm font-semibold">Account active</p>

                <p className="mt-0.5 text-xs text-white/35">
                  Your administrator account is currently active.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ACCOUNT INFORMATION
        ======================================================== */}

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
              <User className="h-5 w-5 text-emerald-100" />
            </div>

            <div>
              <h2 className="font-semibold">Account information</h2>

              <p className="mt-1 text-xs text-white/35">
                Your current SlotGo administrator details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* FIRST NAME */}

            <ProfileField label="First name" value={firstName} icon={User} />

            {/* LAST NAME */}

            <ProfileField
              label="Last name"
              value={lastName || "Not provided"}
              icon={User}
            />

            {/* EMAIL */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-white/30" />

                  <span className="text-xs text-white/35">Email</span>
                </div>

                <button
                  type="button"
                  onClick={copyEmail}
                  disabled={!user?.email}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  title="Copy email"
                  aria-label="Copy email"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-3 truncate text-sm font-semibold text-white/80">
                {user?.email || "Not available"}
              </p>

              {copied && (
                <p className="mt-2 text-[11px] text-emerald-200/70">
                  Email copied.
                </p>
              )}
            </div>

            {/* PHONE */}

            <ProfileField
              label="Phone number"
              value={user?.phoneNumber || "Not provided"}
              icon={Phone}
            />

            {/* ROLE */}

            <ProfileField
              label="Role"
              value="Administrator"
              icon={ShieldCheck}
            />

            {/* USER ID */}

            <ProfileField
              label="Account ID"
              value={user?.id || "Not available"}
              icon={User}
            />
          </div>
        </section>

        {/* ========================================================
            SECURITY
        ======================================================== */}

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
              <ShieldCheck className="h-5 w-5 text-emerald-100" />
            </div>

            <div>
              <h2 className="font-semibold">Account security</h2>

              <p className="mt-1 text-xs text-white/35">
                Manage your current administrator session.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Current session</p>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  You are currently signed in as an administrator. Logging out
                  will remove your local authentication session.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300/10 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8"> 
        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE FIELD
|--------------------------------------------------------------------------
*/

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-white/30" />

        <span className="text-xs text-white/35">{label}</span>
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}
