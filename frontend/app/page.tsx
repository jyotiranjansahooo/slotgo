import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import NearbyParking from "@/components/home/NearbyParking";
import ParkingMap from "@/components/home/ParkingMap";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";

import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080b18]">
      <Navbar />

      <Hero />

      <NearbyParking />

      <ParkingMap />

      <Stats />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
