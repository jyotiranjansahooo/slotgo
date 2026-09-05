import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: {
    default: "SlotGo",
    template: "%s | SlotGo",
  },
  description:
    "SlotGo is a smart parking platform that helps drivers find, book, and manage parking spaces with ease.",
  keywords: [
    "SlotGo",
    "smart parking",
    "parking booking",
    "parking management",
    "online parking",
    "parking reservation",
  ],
  authors: [{ name: "SlotGo" }],
  creator: "SlotGo",
  publisher: "SlotGo",
  applicationName: "SlotGo",
  metadataBase: new URL("http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SlotGo",
    title: "SlotGo | Smart Parking Platform",
    description:
      "Find, book, and manage parking spaces easily with SlotGo.",
    url: "http://localhost:3000",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "SlotGo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SlotGo | Smart Parking Platform",
    description:
      "Find, book, and manage parking spaces easily with SlotGo.",
    images: ["/images/logo.png"],
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};