"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DriverNavbar from "@/components/driver/DriverNavbar";
import Hero from "@/components/landing/Hero";
import NearbyParking from "@/components/home/NearbyParking";
import ParkingMap from "@/components/home/ParkingMap";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import Footer from "@/components/home/Footer";
import ParkingLoader from "@/components/ui/ParkingLoader";

import { useAuth } from "@/providers/AuthProvider";

export default function HomePage() {
  const router = useRouter();

  const { user, isLoading } = useAuth();

  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !minimumLoadingDone || !user) {
      return;
    }

    switch (user.role) {
      case "admin":
        router.replace("/admin");
        break;

      case "parkingOwner":
        router.replace("/owner");
        break;

      case "driver":
        // Drivers use the normal homepage.
        break;

      default:
        break;
    }
  }, [user, isLoading, minimumLoadingDone, router]);
  if (
    isLoading ||
    !minimumLoadingDone ||
    user?.role === "admin" ||
    user?.role === "parkingOwner"
  ) {
    return <ParkingLoader />;
  }

  return (
    <main className="min-h-screen bg-[#080b18]">
    <DriverNavbar />

      <Hero />

      <NearbyParking />

      <ParkingMap />

      <Stats />

      <HowItWorks />

      <Footer />
    </main>
  );
}
