"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/driver",
    icon: "⌂",
  },
  {
    label: "Find Parking",
    href: "/driver/parkings",
    icon: "⌕",
  },
  {
    label: "My Vehicles",
    href: "/driver/vehicles",
    icon: "▣",
  },
  {
    label: "My Bookings",
    href: "/driver/bookings",
    icon: "◷",
  },
];

export default function DriverSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-slate-950 lg:flex lg:flex-col">
      {/* Logo */}

      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link
          href="/driver"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20">
            S
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              SlotGo
            </p>

            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Driver
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Menu
        </p>

        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/driver" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-3",
                "text-sm transition-all duration-200",
                active
                  ? "bg-blue-600/10 text-blue-300"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg text-lg",
                  active
                    ? "bg-blue-600/20 text-blue-300"
                    : "bg-white/[0.04] text-slate-500",
                ].join(" ")}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}

      <div className="border-t border-white/10 p-3">
        <Link
          href="/driver/profile"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
            ⚙
          </span>

          Settings
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
            ↪
          </span>

          Logout
        </button>
      </div>
    </aside>
  );
}