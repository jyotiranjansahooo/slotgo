import type { Metadata } from "next";
import { siteMetadata } from "./metadata";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

import AppLoader from "@/components/layout/AppLoader";
import PageTransition from "@/components/layout/PageTransition";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>
            <AppLoader>
              <PageTransition>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "#064E49",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                    },
                  }}
                />
              </PageTransition>
            </AppLoader>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
