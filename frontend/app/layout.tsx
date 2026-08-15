import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "SlotGo",
  description:
    "Parking management and booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}