"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShieldCheck,
  UserCog,
  UserRound,
  XCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
} from "@/services/admin.service";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsers />
    </ProtectedRoute>
  );
}

function AdminUsers() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminUserRole }) => {
      if (!user?.id) {
        throw new Error("Admin session not found.");
      }

      return updateAdminUserRole(userId, role);
    },

    onSuccess: () => {
      setSelectedUser(null);

      void queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateAdminUserStatus(userId, isActive),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });

  const users = usersQuery.data ?? [];

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!value) {
        return true;
      }

      const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();

      return (
        fullName.includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.phoneNumber?.includes(value)
      );
    });
  }, [users, search, roleFilter]);

  if (usersQuery.isLoading) {
    return <UsersLoading />;
  }

  if (usersQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06544E] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-300" />

          <h1 className="mt-5 text-2xl font-bold">Unable to load users</h1>

          <p className="mt-3 text-sm text-white/45">
            {getApiErrorMessage(usersQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => void usersQuery.refetch()}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#06544E]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06544E] text-white">
<AdminNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-2">
        <div>
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#06544E]">
                <UserCog className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-white/40">Administration</p>

                <h1 className="text-3xl font-bold sm:text-4xl">Users</h1>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="All Users" value={users.length} icon={Users} />

          <SummaryCard
            label="Administrators"
            value={users.filter((user) => user.role === "admin").length}
            icon={ShieldCheck}
          />

          <SummaryCard
            label="Active Users"
            value={users.filter((user) => user.isActive).length}
            icon={CheckCircle2}
          />
        </div>

        {/* FILTERS */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as "all" | AdminUserRole)
              }
              className="rounded-xl border border-white/10 bg-[#064c47] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All roles</option>
              <option value="driver">Drivers</option>
              <option value="parkingOwner">Parking Owners</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </section>

        {/* TABLE */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-white/10 bg-black/10">
                <tr className="text-left text-xs uppercase tracking-wider text-white/30">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onRoleChange={() => setSelectedUser(user)}
                    onStatusChange={() =>
                      statusMutation.mutate({
                        userId: user._id,
                        isActive: !user.isActive,
                      })
                    }
                    statusUpdating={
                      statusMutation.isPending &&
                      statusMutation.variables?.userId === user._id
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <UserRound className="mx-auto h-10 w-10 text-white/20" />

              <p className="mt-4 text-sm font-semibold">No users found</p>

              <p className="mt-1 text-xs text-white/30">
                Try changing your search or role filter.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ROLE MODAL */}

      {selectedUser && (
        <RoleModal
          user={selectedUser}
          loading={roleMutation.isPending}
          error={
            roleMutation.isError ? getApiErrorMessage(roleMutation.error) : null
          }
          onClose={() => setSelectedUser(null)}
          onSave={(role) =>
            roleMutation.mutate({
              userId: selectedUser._id,
              role,
            })
          }
        />
      )}
          <AdminFooter />
    </main>
  );
}

function UserRow({
  user,
  onRoleChange,
  onStatusChange,
  statusUpdating,
}: {
  user: AdminUser;
  onRoleChange: () => void;
  onStatusChange: () => void;
  statusUpdating: boolean;
}) {
  return (
    <tr className="transition hover:bg-white/[0.025]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-bold">
            {user.name.first.charAt(0)}
            {user.name.last.charAt(0)}
          </div>

          <div>
            <p className="font-semibold">
              {user.name.first} {user.name.last}
            </p>

            <p className="mt-1 text-xs text-white/35">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-6 py-5">
        {user.isVerified ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </span>
        ) : (
          <span className="text-xs text-white/35">Not verified</span>
        )}
      </td>

      <td className="px-6 py-5">
        <button
          type="button"
          disabled={statusUpdating}
          onClick={onStatusChange}
          className="inline-flex items-center gap-2"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              user.isActive ? "bg-emerald-300" : "bg-red-300"
            }`}
          />

          <span className="text-xs font-semibold">
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </button>
      </td>

      <td className="px-6 py-5 text-xs text-white/35">
        {user.createdAt ? formatDate(user.createdAt) : "—"}
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRoleChange}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Change role
          </button>
        </div>
      </td>
    </tr>
  );
}

function RoleModal({
  user,
  loading,
  error,
  onClose,
  onSave,
}: {
  user: AdminUser;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (role: AdminUserRole) => void;
}) {
  const [role, setRole] = useState<AdminUserRole>(user.role);

  const roleChanged = role !== user.role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#064c47] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#06544E]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-bold">Change user role</h2>

            <p className="mt-2 text-sm text-white/40">
              {user.name.first} {user.name.last}
            </p>

            <p className="text-xs text-white/30">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-white/30 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <RoleOption
            role="driver"
            label="Driver"
            description="Can search and book parking."
            selected={role === "driver"}
            onClick={() => setRole("driver")}
          />

          <RoleOption
            role="parkingOwner"
            label="Parking Owner"
            description="Can manage parking locations."
            selected={role === "parkingOwner"}
            onClick={() => setRole("parkingOwner")}
          />

          <RoleOption
            role="admin"
            label="Administrator"
            description="Can access the admin dashboard and manage users."
            selected={role === "admin"}
            onClick={() => setRole("admin")}
          />
        </div>

        {role === "admin" && user.role !== "admin" && (
          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/70">
            This will give this existing user full administrator permissions.
            They will need to log in again after the role change.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-xs text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || !roleChanged}
            onClick={() => onSave(role)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#06544E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

            {loading ? "Updating..." : "Save role"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleOption({
  role,
  label,
  description,
  selected,
  onClick,
}: {
  role: AdminUserRole;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-white/30 bg-white/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-4 w-4 rounded-full border-2 ${
            selected ? "border-white bg-white" : "border-white/30"
          }`}
        />

        <div>
          <p className="text-sm font-semibold">{label}</p>

          <p className="mt-1 text-xs text-white/35">{description}</p>
        </div>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| ROLE BADGE
|--------------------------------------------------------------------------
*/

function RoleBadge({ role }: { role: AdminUserRole }) {
  const config = {
    driver: {
      label: "Driver",
      className: "border-blue-300/10 bg-blue-300/5 text-blue-100",
    },

    parkingOwner: {
      label: "Parking Owner",
      className: "border-purple-300/10 bg-purple-300/5 text-purple-100",
    },

    admin: {
      label: "Admin",
      className: "border-amber-300/10 bg-amber-300/5 text-amber-100",
    },
  };

  const current = config[role];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">{label}</p>

          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08]">
          <Icon className="h-5 w-5 text-emerald-100" />
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return <UserRound className="h-4 w-4" />;
}


function UsersLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06544E] text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" />

        <p className="mt-4 text-sm text-white/40">Loading users...</p>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}
