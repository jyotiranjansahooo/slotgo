import type { ReactNode } from "react";

import DriverNavbar from "@/components/driver/DriverNavbar";

export default function DriverLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DriverNavbar />
      {children}
    </div>
  );
}