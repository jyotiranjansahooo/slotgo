"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import {
  getAdminDashboard,
  type AdminDashboardStats,
} from "@/services/admin.service";

import { getApiErrorMessage } from "@/lib/api-error";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function AdminDashboard() {
  const dashboardQuery = useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 30 * 1000,
    retry: 1,
  });

  /*
   * ---------------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------------
   */

  if (dashboardQuery.isLoading) {
    return <DashboardLoading />;
  }

  if (dashboardQuery.isError) {
    return (
      <main className="min-h-screen bg-[#06544E] text-white">
        <AdminNavbar />

        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-red-300/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
            <XCircle className="mx-auto h-12 w-12 text-red-300" />

            <h1 className="mt-5 text-2xl font-bold">
              Unable to load dashboard
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {getApiErrorMessage(dashboardQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => void dashboardQuery.refetch()}
              disabled={dashboardQuery.isFetching}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  dashboardQuery.isFetching ? "animate-spin" : ""
                }`}
              />

              {dashboardQuery.isFetching ? "Retrying..." : "Try again"}
            </button>
          </div>
        </div>
        <AdminFooter />
      </main>
    );
  }

  const stats = dashboardQuery.data;

  if (!stats) {
    return <DashboardLoading />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#06544E] text-white">
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
      </div>

      <AdminNavbar />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#06544E] shadow-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-emerald-100/50">Administration</p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
              Monitor SlotGo users, parking locations, bookings and payments
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                dashboardQuery.isFetching ? "animate-spin" : ""
              }`}
            />

            {dashboardQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* ==========================================================
            PRIMARY STATS
        ========================================================== */}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users.totalUsers}
            subtitle={`${stats.users.activeUsers} active users`}
            icon={Users}
            href="/admin/users"
          />

          <StatCard
            title="Total Parkings"
            value={stats.parkings.totalParkings}
            subtitle={`${stats.parkings.pendingParkings} awaiting approval`}
            icon={CarFront}
            href="/admin/parkings"
          />

          <StatCard
            title="Total Bookings"
            value={stats.bookings.totalBookings}
            subtitle={`${stats.bookings.activeBookings} currently active`}
            icon={CalendarDays}
            href="/admin/bookings"
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(stats.payments.totalRevenue)}
            subtitle={`${stats.payments.successfulPayments} successful payments`}
            icon={DollarSign}
            href="/admin/payments"
          />
        </section>

        {/* ==========================================================
            USERS + PARKINGS
        ========================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* USERS */}

          <Panel
            title="Users"
            description="Current user distribution"
            icon={Users}
          >
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="Drivers"
                value={stats.users.drivers}
                icon={Users}
              />

              <MiniStat
                label="Parking Owners"
                value={stats.users.parkingOwners}
                icon={CarFront}
              />

              <MiniStat
                label="Active"
                value={stats.users.activeUsers}
                icon={CheckCircle2}
              />

              <MiniStat
                label="Inactive"
                value={stats.users.totalUsers - stats.users.activeUsers}
                icon={XCircle}
              />
            </div>

            <Link
              href="/admin/users"
              className="mt-5 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              Manage users
            </Link>
          </Panel>

          {/* PARKINGS */}

          <Panel
            title="Parking"
            description="Parking approval overview"
            icon={MapPin}
          >
            <div className="space-y-3">
              <ProgressRow
                label="Approved"
                value={stats.parkings.approvedParkings}
                total={stats.parkings.totalParkings}
              />

              <ProgressRow
                label="Pending"
                value={stats.parkings.pendingParkings}
                total={stats.parkings.totalParkings}
              />

              <ProgressRow
                label="Rejected"
                value={stats.parkings.rejectedParkings}
                total={stats.parkings.totalParkings}
              />

              <ProgressRow
                label="Active"
                value={stats.parkings.activeParkings}
                total={stats.parkings.totalParkings}
              />
            </div>

            <Link
              href="/admin/parkings"
              className="mt-5 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              Manage parkings
            </Link>
          </Panel>
        </section>

        {/* ==========================================================
            BOOKINGS + PAYMENTS
        ========================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* BOOKINGS */}

          <Panel
            title="Bookings"
            description="Booking lifecycle"
            icon={CalendarDays}
          >
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="Pending"
                value={stats.bookings.pendingBookings}
                icon={Clock3}
              />

              <MiniStat
                label="Confirmed"
                value={stats.bookings.confirmedBookings}
                icon={CheckCircle2}
              />

              <MiniStat
                label="Active"
                value={stats.bookings.activeBookings}
                icon={Activity}
              />

              <MiniStat
                label="Completed"
                value={stats.bookings.completedBookings}
                icon={CheckCircle2}
              />

              <MiniStat
                label="Cancelled"
                value={stats.bookings.cancelledBookings}
                icon={XCircle}
              />

              <MiniStat
                label="Expired"
                value={stats.bookings.expiredBookings}
                icon={Clock3}
              />
            </div>

            <Link
              href="/admin/bookings"
              className="mt-5 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              View bookings
            </Link>
          </Panel>

          {/* PAYMENTS */}

          <Panel
            title="Payments"
            description="Payment and revenue overview"
            icon={CreditCard}
          >
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="Successful"
                value={stats.payments.successfulPayments}
                icon={CheckCircle2}
              />

              <MiniStat
                label="Pending"
                value={stats.payments.pendingPayments}
                icon={Clock3}
              />

              <MiniStat
                label="Failed"
                value={stats.payments.failedPayments}
                icon={XCircle}
              />

              <MiniStat
                label="Refunded"
                value={stats.payments.refundedPayments}
                icon={ArrowDownRight}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-wider text-white/35">
                Total Revenue
              </p>

              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(stats.payments.totalRevenue)}
              </p>
            </div>

            <Link
              href="/admin/payments"
              className="mt-5 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              View payments
            </Link>
          </Panel>
        </section>
        <section className="mt-6">
          <Panel
            title="Quick actions"
            description="Common administration tasks"
            icon={UserCog}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                href="/admin/users"
                icon={Users}
                title="Manage Users"
                description="Roles and account status"
              />

              <QuickAction
                href="/admin/parkings"
                icon={MapPin}
                title="Review Parkings"
                description={`${stats.parkings.pendingParkings} pending`}
              />

              <QuickAction
                href="/admin/bookings"
                icon={CalendarDays}
                title="Bookings"
                description="Monitor all bookings"
              />

              <QuickAction
                href="/admin/payments"
                icon={CreditCard}
                title="Payments"
                description="Review transactions"
              />
            </div>
          </Panel>
        </section>
      </div>
        <AdminFooter/>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/5 blur-2xl transition group-hover:bg-emerald-200/10" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <Icon className="h-5 w-5 text-emerald-100" />
          </div>

          <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white/60" />
        </div>

        <p className="mt-5 text-sm text-white/40">{title}</p>

        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>

        <p className="mt-2 text-xs text-white/30">{subtitle}</p>
      </div>
    </Link>
  );
}

/*
|--------------------------------------------------------------------------
| PANEL
|--------------------------------------------------------------------------
*/

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07]">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>

        <div>
          <h2 className="font-semibold">{title}</h2>

          <p className="mt-1 text-xs text-white/35">{description}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| MINI STAT
|--------------------------------------------------------------------------
*/

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/35">{label}</span>

        <Icon className="h-4 w-4 text-white/25" />
      </div>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROGRESS ROW
|--------------------------------------------------------------------------
*/

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.min(100, (value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-white/45">{label}</span>

        <span className="font-semibold text-white/70">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-emerald-300/60 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <Icon className="h-5 w-5 text-emerald-100/70 transition group-hover:text-emerald-100" />

      <p className="mt-4 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-white/30">{description}</p>
    </Link>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06544E] text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" />

        <p className="mt-4 text-sm text-white/40">Loading admin dashboard...</p>
      </div>
    </main>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
