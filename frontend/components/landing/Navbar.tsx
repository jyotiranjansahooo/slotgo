"use client";

import { useState } from "react";
import { Menu, X, MapPin, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function Navbar() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * ============================================================
   * NORMAL NAVIGATION
   * ============================================================
   */

  const goTo = (path: string) => {
    setMobileOpen(false);

    router.push(path);
  };

  /*
   * ============================================================
   * ROLE DASHBOARD
   * ============================================================
   */

  const goToDashboard = () => {
    setMobileOpen(false);

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "driver") {
      router.push("/driver");
      return;
    }

    if (user.role === "parkingOwner") {
      router.push("/owner");
      return;
    }

    if (user.role === "admin") {
      router.push("/admin");
      return;
    }

    router.push("/");
  };

  /*
   * ============================================================
   * DRIVER-ONLY NAVIGATION
   * ============================================================
   *
   * Find Parking + My Bookings
   *
   * Not authenticated
   *      ↓
   * /login
   *
   * Driver
   *      ↓
   * requested page
   *
   * Parking Owner
   *      ↓
   * /owner
   *
   * Admin
   *      ↓
   * /admin
   */

  const goToDriverPage = (path: string) => {
    setMobileOpen(false);

    /*
     * Do not navigate while AuthProvider
     * is still checking localStorage.
     */
    if (isLoading) {
      return;
    }

    /*
     * User is not authenticated.
     */
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    /*
     * Driver can access the page.
     */
    if (user.role === "driver") {
      router.push(path);
      return;
    }

    /*
     * Parking owner.
     */
    if (user.role === "parkingOwner") {
      router.push("/owner");
      return;
    }

    /*
     * Admin.
     */
    if (user.role === "admin") {
      router.push("/admin");
      return;
    }

    /*
     * Fallback.
     */
    router.push("/login");
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    setMobileOpen(false);

    logout();

    router.push("/");
  };

  /*
   * ============================================================
   * HOW IT WORKS
   * ============================================================
   */

  const scrollToHowItWorks = () => {
    setMobileOpen(false);

    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        {/* ======================================================
            LOGO
        ====================================================== */}

        <button
          type="button"
          onClick={() => goTo("/")}
          className="group flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
            <MapPin
              size={21}
              strokeWidth={2.5}
              className="text-indigo-600"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            SlotGo
          </span>
        </button>

        {/* ======================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="hidden items-center gap-8 md:flex">
          {/* FIND PARKING */}

          <button
            type="button"
            onClick={() => goToDriverPage("/driver/parkings")}
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Find Parking
          </button>

          {/* MY BOOKINGS */}

          <button
            type="button"
            onClick={() => goToDriverPage("/driver/bookings")}
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            My Bookings
          </button>

          {/* HOW IT WORKS */}

          <button
            type="button"
            onClick={scrollToHowItWorks}
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            How It Works
          </button>
        </div>

        {/* ======================================================
            DESKTOP ACTIONS
        ====================================================== */}

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              {/* DASHBOARD */}

              <button
                type="button"
                onClick={goToDashboard}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Dashboard
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-white/90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* SIGN IN */}

              <button
                type="button"
                onClick={() => goTo("/login")}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <LogIn size={16} />

                Sign in
              </button>

              {/* GET STARTED */}

              <button
                type="button"
                onClick={() => goTo("/register")}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-white/90"
              >
                <UserPlus size={16} />

                Get Started
              </button>
            </>
          )}
        </div>

        {/* ======================================================
            MOBILE MENU BUTTON
        ====================================================== */}

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md md:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

      {mobileOpen && (
        <div className="mx-4 overflow-hidden rounded-2xl border border-white/20 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {/* FIND PARKING */}

            <button
              type="button"
              onClick={() => goToDriverPage("/driver/parkings")}
              className="rounded-xl px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
            >
              Find Parking
            </button>

            {/* MY BOOKINGS */}

            <button
              type="button"
              onClick={() => goToDriverPage("/driver/bookings")}
              className="rounded-xl px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
            >
              My Bookings
            </button>

            {/* HOW IT WORKS */}

            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="rounded-xl px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
            >
              How It Works
            </button>

            <div className="my-2 h-px bg-white/10" />

            {/* ==================================================
                AUTHENTICATED
            ================================================== */}

            {isAuthenticated && user ? (
              <>
                {/* DASHBOARD */}

                <button
                  type="button"
                  onClick={goToDashboard}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700"
                >
                  Dashboard
                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* SIGN IN */}

                <button
                  type="button"
                  onClick={() => goTo("/login")}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white"
                >
                  Sign in
                </button>

                {/* GET STARTED */}

                <button
                  type="button"
                  onClick={() => goTo("/register")}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}