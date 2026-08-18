
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Home",
    href: "/driver",
    icon: "⌂",
  },
  {
    label: "Parking",
    href: "/driver/parkings",
    icon: "⌕",
  },
  {
    label: "Bookings",
    href: "/driver/bookings",
    icon: "◷",
  },
  {
    label: "Vehicles",
    href: "/driver/vehicles",
    icon: "▣",
  },
];

export default function DriverMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
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
                "flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2",
                "text-[10px] transition",
                active
                  ? "text-blue-300"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              <span className="text-lg">{item.icon}</span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}