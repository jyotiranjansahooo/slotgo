"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getParkings } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { MapPinSearch, Search } from "lucide-react";

import type { Parking } from "@/types/parking";

/* ============================================================
   TYPES
   ============================================================ */

type VehicleFilter =
  | "all"
  | "twoWheeler"
  | "fourWheeler"
  | "vanMinibus"
  | "heavyVehicle";

type SortOption =
  | "none"
  | "priceLowToHigh"
  | "priceHighToLow"
  | "ratingHighToLow"
  | "ratingLowToHigh";

interface FilterState {
  search: string;
  location: string;
  vehicleType: VehicleFilter;
  sortBy: SortOption;
}

/* ============================================================
   PAGE
   ============================================================ */

export default function ParkingsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <ParkingList />
    </ProtectedRoute>
  );
}

/* ============================================================
   PARKING LIST
   ============================================================ */

function ParkingList() {
  const router = useRouter();

  /* ==========================================================
     PARKING QUERY
     ========================================================== */

  const parkingQuery = useQuery({
    queryKey: ["parkings"],
    queryFn: async () => {
      const response = await getParkings();
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  /* ==========================================================
     FILTER STATE
     ========================================================== */

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleFilter>("all");

  /*
   * Single sorting state.
   *
   * Price and rating are now combined into one
   * "Sort by" option.
   */
  const [sortBy, setSortBy] = useState<SortOption>("none");

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    search: "",
    location: "",
    vehicleType: "all",
    sortBy: "none",
  });

  const [showFilters, setShowFilters] = useState(false);

  /* ==========================================================
     NEARBY STATE
     ========================================================== */

  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [nearbyLocation, setNearbyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* ==========================================================
     PARKINGS
     ========================================================== */

  const parkings: Parking[] = parkingQuery.data ?? [];

  /* ==========================================================
     FILTERED PARKINGS
     ========================================================== */

  const filteredParkings = useMemo(() => {
    const normalizedSearch = appliedFilters.search.trim().toLowerCase();

    const normalizedLocation = appliedFilters.location.trim().toLowerCase();

    let result = [...parkings];

    /* --------------------------------------------------------
       SEARCH
       -------------------------------------------------------- */

    if (normalizedSearch) {
      result = result.filter((parking) => {
        const name = parking.parkingName?.toLowerCase() ?? "";

        const address = parking.address?.toLowerCase() ?? "";

        const city = parking.city?.toLowerCase() ?? "";

        const state = parking.state?.toLowerCase() ?? "";

        const pincode = String(parking.pincode ?? "").toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          address.includes(normalizedSearch) ||
          city.includes(normalizedSearch) ||
          state.includes(normalizedSearch) ||
          pincode.includes(normalizedSearch)
        );
      });
    }

    /* --------------------------------------------------------
       LOCATION / AREA
       -------------------------------------------------------- */

    if (normalizedLocation) {
      result = result.filter((parking) => {
        const address = parking.address?.toLowerCase() ?? "";

        const city = parking.city?.toLowerCase() ?? "";

        const state = parking.state?.toLowerCase() ?? "";

        const pincode = String(parking.pincode ?? "").toLowerCase();

        return (
          address.includes(normalizedLocation) ||
          city.includes(normalizedLocation) ||
          state.includes(normalizedLocation) ||
          pincode.includes(normalizedLocation)
        );
      });
    }

    /* --------------------------------------------------------
       VEHICLE TYPE
       -------------------------------------------------------- */

    if (appliedFilters.vehicleType !== "all") {
      result = result.filter((parking) => {
        const pricing = parking.pricing;

        if (!pricing) {
          return false;
        }

        switch (appliedFilters.vehicleType) {
          case "twoWheeler":
            return typeof pricing.twoWheeler?.hourly === "number";

          case "fourWheeler":
            return typeof pricing.fourWheeler?.hourly === "number";

          case "vanMinibus":
            return typeof pricing.vanMinibus?.hourly === "number";

          case "heavyVehicle":
            return typeof pricing.heavyVehicle?.hourly === "number";

          default:
            return true;
        }
      });
    }

    /* --------------------------------------------------------
       SORT BY
       -------------------------------------------------------- */

    switch (appliedFilters.sortBy) {
      case "priceLowToHigh":
        result.sort((a, b) => {
          const priceA = getStartingPrice(a);
          const priceB = getStartingPrice(b);

          return priceA - priceB;
        });
        break;

      case "priceHighToLow":
        result.sort((a, b) => {
          const priceA = getStartingPrice(a);
          const priceB = getStartingPrice(b);

          return priceB - priceA;
        });
        break;

      case "ratingHighToLow":
        result.sort((a, b) => {
          const ratingA = Number(a.averageRating || 0);

          const ratingB = Number(b.averageRating || 0);

          return ratingB - ratingA;
        });
        break;

      case "ratingLowToHigh":
        result.sort((a, b) => {
          const ratingA = Number(a.averageRating || 0);

          const ratingB = Number(b.averageRating || 0);

          return ratingA - ratingB;
        });
        break;

      case "none":
      default:
        break;
    }

    /* --------------------------------------------------------
       NEARBY SORT
       --------------------------------------------------------

       If nearby search is active, distance sorting takes
       priority over the selected price/rating sorting.
       -------------------------------------------------------- */

    if (nearbyLocation) {
      result.sort((a, b) => {
        const distanceA = getParkingDistance(
          a,
          nearbyLocation.latitude,
          nearbyLocation.longitude,
        );

        const distanceB = getParkingDistance(
          b,
          nearbyLocation.latitude,
          nearbyLocation.longitude,
        );

        if (distanceA === Infinity && distanceB !== Infinity) {
          return 1;
        }

        if (distanceA !== Infinity && distanceB === Infinity) {
          return -1;
        }

        return distanceA - distanceB;
      });
    }

    return result;
  }, [parkings, appliedFilters, nearbyLocation]);

  /* ==========================================================
     ACTIVE FILTER COUNT
     ========================================================== */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (appliedFilters.search.trim()) {
      count++;
    }

    if (appliedFilters.location.trim()) {
      count++;
    }

    if (appliedFilters.vehicleType !== "all") {
      count++;
    }

    if (appliedFilters.sortBy !== "none") {
      count++;
    }

    return count;
  }, [appliedFilters]);

  /* ==========================================================
     APPLY FILTERS
     ========================================================== */

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: search.trim(),
      location: location.trim(),
      vehicleType,
      sortBy,
    });

    setShowFilters(false);
  };

  /* ==========================================================
     CLEAR FILTERS
     ========================================================== */

  const handleClearFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      location: "",
      vehicleType: "all",
      sortBy: "none",
    };

    setSearch("");
    setLocation("");
    setVehicleType("all");
    setSortBy("none");

    setAppliedFilters(emptyFilters);

    setNearbyLocation(null);
  };

  /* ==========================================================
     SEARCH NEARBY
     ========================================================== */

  const handleSearchNearby = () => {
    if (!navigator.geolocation) {
      alert("Location services are not supported by your browser.");

      return;
    }

    setNearbyLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setNearbyLoading(false);
      },
      () => {
        setNearbyLoading(false);

        alert(
          "Unable to access your location. Please allow location permission and try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  /* ==========================================================
     LOADING
     ========================================================== */

  if (parkingQuery.isLoading) {
    return <ParkingSkeletonPage />;
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  if (parkingQuery.isError) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white">
        <BackgroundPattern />

        <div className="relative z-10">
          <DriverNavbar />

          <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 text-zinc-900 shadow-2xl sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl font-bold text-red-600">
                !
              </div>

              <h1 className="mt-5 text-xl font-bold">
                Unable to load parking locations
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {getApiErrorMessage(parkingQuery.error)}
              </p>

              <button
                type="button"
                onClick={() => void parkingQuery.refetch()}
                className="mt-6 rounded-xl bg-[#4338ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3730d8]"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     MAIN UI
     ========================================================== */

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <BackgroundPattern />

      <div className="relative z-10">
        <DriverNavbar />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          {/* ==================================================
              HEADER
             ================================================== */}

          <section>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Find Your
                  <span className="block">Parking Space.</span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-50/80 sm:text-base">
                  Discover nearby parking spaces, compare prices and ratings,
                  and reserve your spot without the usual hassle.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSearchNearby}
                disabled={nearbyLoading}
                className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#4338ff] shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-end"
              >
                <span className="text-lg">
                  <MapPinSearch />
                </span>

                {nearbyLoading ? "Finding nearby..." : "Parking nearby"}
              </button>
            </div>
          </section>

          {/* ==================================================
              SEARCH + FILTERS
             ================================================== */}

          <section className="mt-8">
            <div className="rounded-3xl border border-white/20 bg-white/95 p-3 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* SEARCH */}

                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Search />
                  </span>

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleApplyFilters();
                      }
                    }}
                    placeholder="Search parking by name, city, address..."
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#4338ff] focus:bg-white"
                  />
                </div>

                {/* SEARCH BUTTON */}

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="h-12 rounded-2xl bg-[#4338ff] px-7 text-sm font-bold text-white transition hover:bg-[#3730d8]"
                >
                  Search
                </button>

                {/* FILTER BUTTON */}

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="h-12 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4338ff] px-1.5 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* ==================================================
                  FILTER PANEL
                 ================================================== */}

              {showFilters && (
                <div className="mt-3 border-t border-zinc-100 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* LOCATION */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Area / Location
                      </label>

                      <input
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="e.g. Bhubaneswar"
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-[#4338ff] focus:bg-white"
                      />
                    </div>

                    {/* VEHICLE */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Vehicle type
                      </label>

                      <select
                        value={vehicleType}
                        onChange={(event) =>
                          setVehicleType(event.target.value as VehicleFilter)
                        }
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-[#4338ff]"
                      >
                        <option value="all">All vehicles</option>

                        <option value="twoWheeler">Two Wheeler</option>

                        <option value="fourWheeler">Four Wheeler</option>

                        <option value="vanMinibus">Van / Minibus</option>

                        <option value="heavyVehicle">Heavy Vehicle</option>
                      </select>
                    </div>

                    {/* SORT BY */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Sort by
                      </label>

                      <select
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(event.target.value as SortOption)
                        }
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-[#4338ff]"
                      >
                        <option value="none">Default</option>

                        <option value="priceLowToHigh">
                          Price: Low to High
                        </option>

                        <option value="priceHighToLow">
                          Price: High to Low
                        </option>

                        <option value="ratingHighToLow">
                          Rating: High to Low
                        </option>

                        <option value="ratingLowToHigh">
                          Rating: Low to High
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* FILTER BUTTONS */}

                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      Clear filters
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="h-11 rounded-xl bg-[#4338ff] px-6 text-sm font-semibold text-white transition hover:bg-[#3730d8]"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              RESULTS COUNT
             ================================================== */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {filteredParkings.length}{" "}
                {filteredParkings.length === 1
                  ? "parking location"
                  : "parking locations"}
              </p>

              {nearbyLocation && (
                <p className="mt-1 text-xs text-blue-100/70">
                  Sorted by distance from your current location.
                </p>
              )}

              {appliedFilters.sortBy !== "none" && !nearbyLocation && (
                <p className="mt-1 text-xs text-blue-100/70">
                  {getSortLabel(appliedFilters.sortBy)}
                </p>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="self-start text-sm font-semibold text-blue-100 underline underline-offset-4 transition hover:text-white sm:self-auto"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* ==================================================
              RESULTS
             ================================================== */}

          {filteredParkings.length === 0 ? (
            <NoParkingState
              hasLocationFilter={
                Boolean(appliedFilters.location.trim()) ||
                Boolean(appliedFilters.search.trim())
              }
              location={appliedFilters.location}
              onClear={handleClearFilters}
            />
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredParkings.map((parking) => (
                <ParkingCard
                  key={parking._id}
                  parking={parking}
                  nearbyLocation={nearbyLocation}
                  onClick={() => router.push(`/driver/parkings/${parking._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SORT LABEL
   ============================================================ */

function getSortLabel(sortBy: SortOption): string {
  switch (sortBy) {
    case "priceLowToHigh":
      return "Sorted by price: Low to High";

    case "priceHighToLow":
      return "Sorted by price: High to Low";

    case "ratingHighToLow":
      return "Sorted by rating: High to Low";

    case "ratingLowToHigh":
      return "Sorted by rating: Low to High";

    case "none":
    default:
      return "";
  }
}

/* ============================================================
   NAVBAR
   ============================================================ */

function DriverNavbar() {
  const router = useRouter();

  return (
    <nav className="border-b border-white/15 bg-[#4338ff]/20 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}

        <button
          type="button"
          onClick={() => router.push("/driver")}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#4338ff] shadow-lg">
            <MapPinSearch />
          </div>

          <span className="text-xl font-black tracking-tight text-white">
            SlotGo
          </span>
        </button>

        {/* NAV */}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/driver")}
            className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:block"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => router.push("/driver/bookings")}
            className="rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-[#4338ff] sm:px-4"
          >
            My Bookings
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   BACKGROUND
   ============================================================ */

function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#4338ff]"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #4f46ff 0px,
              #4f46ff 82px,
              #5550ff 82px,
              #5550ff 164px,
              #4338ff 164px,
              #4338ff 246px
            )
          `,
        }}
      />

      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(125,211,252,0.16), transparent 35%, rgba(96,165,250,0.08))",
        }}
      />

      <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="absolute -left-32 bottom-20 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl" />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(255,255,255,0.16) 81px, transparent 82px)",
        }}
      />
    </div>
  );
}

/* ============================================================
   PARKING CARD
   ============================================================ */

interface ParkingCardProps {
  parking: Parking;

  onClick: () => void;

  nearbyLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

function ParkingCard({ parking, onClick, nearbyLocation }: ParkingCardProps) {
  const price = getStartingPrice(parking);

  const distance = nearbyLocation
    ? getParkingDistance(
        parking,
        nearbyLocation.latitude,
        nearbyLocation.longitude,
      )
    : Infinity;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/30 bg-white shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-blue-950/30">
      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-zinc-100">
        {parking.images?.length > 0 ? (
          <Image
            src={parking.images[0].url}
            alt={parking.parkingName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 text-sm font-medium text-zinc-400">
            No image available
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

        {/* PARKING TYPE */}

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-800 shadow-sm backdrop-blur">
            {parking.parkingType}
          </span>
        </div>

        {/* DISTANCE */}

        {distance !== Infinity && (
          <div className="absolute bottom-4 right-4 rounded-full bg-[#4338ff]/95 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
            {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 min-w-0 text-lg font-bold text-zinc-950">
            {parking.parkingName}
          </h2>

          {/* PRICE + RATING */}

          <div className="flex shrink-0 items-center gap-3">
            {/* PRICE */}

            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                From
              </p>

              <p className="text-lg font-black text-[#4338ff]">₹{price}</p>
            </div>

            <div className="h-8 w-px bg-zinc-200" />

            {/* RATING */}

            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Rating
              </p>

              <p className="text-sm font-bold text-amber-500">
                ★ {Number(parking.averageRating || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* ADDRESS */}

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
          {parking.address}
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          {parking.city}, {parking.state} {parking.pincode}
        </p>

        <p className="mt-2 text-xs text-zinc-400">
          {parking.totalReviews} reviews
        </p>

        {/* BUTTON */}

        <button
          type="button"
          onClick={onClick}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-[#4338ff] text-sm font-bold text-white shadow-lg shadow-[#4338ff]/20 transition hover:bg-[#3730d8]"
        >
          View parking
          <span className="ml-2 transition group-hover:translate-x-1">→</span>
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   NO PARKING
   ============================================================ */

interface NoParkingStateProps {
  hasLocationFilter: boolean;
  location: string;
  onClear: () => void;
}

function NoParkingState({
  hasLocationFilter,
  location,
  onClear,
}: NoParkingStateProps) {
  return (
    <div className="mt-8 rounded-3xl border border-white/20 bg-white p-8 text-center text-zinc-900 shadow-2xl sm:p-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#4338ff]">
        ⌖
      </div>

      {hasLocationFilter ? (
        <>
          <h2 className="mt-5 text-2xl font-black">
            Sorry, we are not here yet.
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            We couldn&apos;t find an approved parking location
            {location ? ` in ${location}` : " matching your search"}. Try
            another area or clear your filters.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-2xl font-black">
            No parking locations found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Try changing your vehicle type, sort option, or search for another
            location.
          </p>
        </>
      )}

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-[#4338ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3730d8]"
      >
        Clear filters
      </button>
    </div>
  );
}

/* ============================================================
   SKELETON PAGE
   ============================================================ */

function ParkingSkeletonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10">
        <DriverNavbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* HEADER */}

            <div className="h-8 w-48 rounded-lg bg-white/20" />

            <div className="mt-5 h-14 w-72 rounded-xl bg-white/20 sm:w-96" />

            <div className="mt-4 h-5 w-full max-w-xl rounded bg-white/15" />

            {/* SEARCH */}

            <div className="mt-8 rounded-3xl bg-white p-3">
              <div className="h-12 rounded-2xl bg-zinc-200" />
            </div>

            {/* CARDS */}

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ParkingCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SKELETON CARD
   ============================================================ */

function ParkingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/20 bg-white">
      <div className="h-52 animate-pulse bg-zinc-200" />

      <div className="space-y-4 p-5">
        <div className="flex justify-between gap-4">
          <div className="h-5 w-2/5 animate-pulse rounded bg-zinc-200" />

          <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
        </div>

        <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />

        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />

        <div className="h-12 w-full animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    </div>
  );
}

/* ============================================================
   STARTING PRICE
   ============================================================ */

function getStartingPrice(parking: Parking): number {
  const prices = [
    parking.pricing?.twoWheeler?.hourly,
    parking.pricing?.fourWheeler?.hourly,
    parking.pricing?.vanMinibus?.hourly,
    parking.pricing?.heavyVehicle?.hourly,
  ].filter((price): price is number => typeof price === "number" && price >= 0);

  if (prices.length === 0) {
    return 0;
  }

  return Math.min(...prices);
}

/* ============================================================
   PARKING COORDINATES
   ============================================================ */

function getParkingCoordinates(parking: Parking): {
  latitude: number;
  longitude: number;
} | null {
  const item = parking as Parking & {
    latitude?: number;
    longitude?: number;

    location?: {
      latitude?: number;
      longitude?: number;
      coordinates?: [number, number];
    };
  };

  if (typeof item.latitude === "number" && typeof item.longitude === "number") {
    return {
      latitude: item.latitude,
      longitude: item.longitude,
    };
  }

  if (
    typeof item.location?.latitude === "number" &&
    typeof item.location?.longitude === "number"
  ) {
    return {
      latitude: item.location.latitude,
      longitude: item.location.longitude,
    };
  }

  if (
    Array.isArray(item.location?.coordinates) &&
    item.location.coordinates.length >= 2
  ) {
    const [longitude, latitude] = item.location.coordinates;

    if (typeof latitude === "number" && typeof longitude === "number") {
      return {
        latitude,
        longitude,
      };
    }
  }

  return null;
}

/* ============================================================
   DISTANCE
   ============================================================ */

function getParkingDistance(
  parking: Parking,
  userLatitude: number,
  userLongitude: number,
): number {
  const coordinates = getParkingCoordinates(parking);

  if (!coordinates) {
    return Infinity;
  }

  return haversineDistance(
    userLatitude,
    userLongitude,
    coordinates.latitude,
    coordinates.longitude,
  );
}

/* ============================================================
   HAVERSINE DISTANCE
   ============================================================ */

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/* ============================================================
   RADIANS
   ============================================================ */

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}
