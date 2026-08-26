"use client";

import { useEffect, useState } from "react";
import ParkingLoader from "../ui/ParkingLoader";

interface AppLoaderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "slotgo-app-loaded";

export default function AppLoader({
  children,
}: AppLoaderProps) {
  const [status, setStatus] = useState<
    "checking" | "loading" | "ready"
  >("checking");

  useEffect(() => {
    const alreadyLoaded =
      sessionStorage.getItem(STORAGE_KEY) === "true";

    if (alreadyLoaded) {
      const timer = window.setTimeout(() => {
        setStatus("ready");
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

   
    sessionStorage.setItem(STORAGE_KEY, "true");

    const startTimer = window.setTimeout(() => {
      setStatus("loading");
    }, 0);

    const finishTimer = window.setTimeout(() => {
      setStatus("ready");
    }, 1600);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (status === "checking" || status === "loading") {
    return <ParkingLoader />;
  }

  return <>{children}</>;
}