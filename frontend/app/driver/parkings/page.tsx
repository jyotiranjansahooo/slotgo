"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Car,
  Clock3,
  LoaderCircle,
  MapPin,
  MapPinSearch,
  Navigation,
  Phone,
  Search,
  Star,
  UserRound,
  ArrowRight,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getApprovedParkings } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Parking, VehicleType } from "@/types/parking";

type VehicleFilter = "all" | VehicleType;

type SortOption =
  | "none"
  | "distance"
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

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface StartingPrice {
  amount: number | null;
  period: "hour" | "day" | "month" | null;
}

export default function ParkingsPage() {
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <ParkingList />
    </ProtectedRoute>
  );
}

function ParkingList() {
  const router = useRouter();

  const parkingQuery = useQuery({
    queryKey: ["driver-parkings"],
    queryFn: getApprovedParkings,
    staleTime: 60 * 1000,
  });

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("none");

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    search: "",
    location: "",
    vehicleType: "all",
    sortBy: "none",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [directionLoadingId, setDirectionLoadingId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, []);
  const parkings: Parking[] = parkingQuery.data ?? [];

  const filteredParkings = useMemo(() => {
    let result = [...parkings];

    const normalizedSearch = appliedFilters.search.trim().toLowerCase();

    const normalizedLocation = appliedFilters.location.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((parking) => {
        const searchableText = [
          parking.parkingName,
          parking.address,
          parking.landmark,
          parking.city,
          parking.state,
          parking.pincode,
          parking.ownerName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      });
    }

    if (normalizedLocation) {
      result = result.filter((parking) => {
        const locationText = [
          parking.address,
          parking.landmark,
          parking.city,
          parking.state,
          parking.pincode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return locationText.includes(normalizedLocation);
      });
    }

    if (appliedFilters.vehicleType !== "all") {
      const selectedVehicleType = appliedFilters.vehicleType;

      result = result.filter((parking) =>
        parking.supportedVehicleTypes?.includes(selectedVehicleType),
      );
    }

    switch (appliedFilters.sortBy) {
      case "distance":
        if (userLocation) {
          result.sort((a, b) => {
            const distanceA = getParkingDistance(
              a,
              userLocation.latitude,
              userLocation.longitude,
            );

            const distanceB = getParkingDistance(
              b,
              userLocation.latitude,
              userLocation.longitude,
            );

            return distanceA - distanceB;
          });
        }
        break;

      case "priceLowToHigh":
        result.sort((a, b) => {
          const priceA = getStartingPrice(a).amount;

          const priceB = getStartingPrice(b).amount;

          return (priceA ?? Infinity) - (priceB ?? Infinity);
        });
        break;

      case "priceHighToLow":
        result.sort((a, b) => {
          const priceA = getStartingPrice(a).amount;

          const priceB = getStartingPrice(b).amount;

          return (priceB ?? -Infinity) - (priceA ?? -Infinity);
        });
        break;

      case "ratingHighToLow":
        result.sort(
          (a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0),
        );
        break;

      case "ratingLowToHigh":
        result.sort(
          (a, b) => Number(a.averageRating || 0) - Number(b.averageRating || 0),
        );
        break;

      default:
        break;
    }

    return result;
  }, [parkings, appliedFilters, userLocation]);

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

  const handleApplyFilters = () => {
    const nextFilters: FilterState = {
      search: search.trim(),
      location: location.trim(),
      vehicleType,
      sortBy,
    };

    setAppliedFilters(nextFilters);
    setShowFilters(false);
  };

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
    setUserLocation(null);
  };

  const handleSearchNearby = () => {
    if (!navigator.geolocation) {
      window.alert("Location services are not supported by your browser.");

      return;
    }

    setNearbyLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(currentLocation);

        setSortBy("distance");

        setAppliedFilters((current) => ({
          ...current,
          sortBy: "distance",
        }));

        setNearbyLoading(false);
      },
      () => {
        setNearbyLoading(false);

        window.alert(
          "Unable to access your location. Please allow location permission and try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  const handleGetDirections = (parking: Parking) => {
    const coordinates = getParkingCoordinates(parking);

    if (!coordinates) {
      window.alert(
        "Directions are not available because this parking does not have a valid location.",
      );

      return;
    }

    setDirectionLoadingId(parking._id);

    const destination = `${coordinates.latitude},${coordinates.longitude}`;

    const mapsTab = window.open("about:blank", "_blank");

    if (!mapsTab) {
      setDirectionLoadingId(null);

      window.alert(
        "Google Maps could not be opened. Please allow pop-ups for SlotGo.",
      );

      return;
    }

    const openGoogleMaps = (origin?: string) => {
      const params = new URLSearchParams();

      params.set("api", "1");
      params.set("destination", destination);
      params.set("travelmode", "driving");

      if (origin) {
        params.set("origin", origin);
      }

      mapsTab.location.href = `https://www.google.com/maps/dir/?${params.toString()}`;

      setDirectionLoadingId(null);
    };

    if (!navigator.geolocation) {
      openGoogleMaps();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;

        openGoogleMaps(origin);
      },
      () => {
        openGoogleMaps();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  if (parkingQuery.isLoading) {
    return <ParkingSkeletonPage />;
  }

  if (parkingQuery.isError) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white">
        <BackgroundPattern />

        <div className="relative z-10">
          <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-blue-300 p-8 text-zinc-900 shadow-2xl">
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
                className="mt-6 rounded-xl bg-[#4338ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3730d8] active:scale-95"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mt-16 min-h-screen overflow-hidden text-white">
      <BackgroundPattern />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <section>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Find Your
                  <span className="block">Parking Space.</span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-50/80 sm:text-base">
                  Search parking by name, city or address, or find the closest
                  parking around you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSearchNearby}
                disabled={nearbyLoading}
                className="group inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#4338ff] shadow-xl transition duration-200 hover:-translate-y-1 hover:bg-blue-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 lg:self-end"
              >
                {nearbyLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <MapPinSearch className="h-5 w-5 transition-transform group-hover:scale-110" />
                )}

                {nearbyLoading
                  ? "Finding nearby..."
                  : userLocation
                    ? "Location found"
                    : "Parking nearby"}
              </button>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-3xl border border-white/20 bg-white/95 p-3 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleApplyFilters();
                      }
                    }}
                    placeholder="Search parking name, city, address, owner..."
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#4338ff] focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="h-12 rounded-2xl bg-[#4338ff] px-7 text-sm font-bold text-white transition hover:bg-[#3730d8] active:scale-95"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="h-12 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 active:scale-95"
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4338ff] px-1.5 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 border-t border-zinc-100 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Area / Location
                      </label>

                      <input
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="Bhubaneswar, Cuttack..."
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-[#4338ff] focus:bg-white"
                      />
                    </div>

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

                        <option value="distance">Nearest first</option>

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

                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 active:scale-95"
                    >
                      Clear filters
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="h-11 rounded-xl bg-[#4338ff] px-6 text-sm font-semibold text-white transition hover:bg-[#3730d8] active:scale-95"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {filteredParkings.length}{" "}
                {filteredParkings.length === 1
                  ? "parking location"
                  : "parking locations"}
              </p>

              {userLocation && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-100/70">
                  <MapPin className="h-3.5 w-3.5" />
                  Nearest parking shown first
                </p>
              )}
            </div>

            {(activeFilterCount > 0 || userLocation) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="self-start text-sm font-semibold text-blue-100 underline underline-offset-4 transition hover:text-white sm:self-auto"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredParkings.length === 0 ? (
            <NoParkingState
              hasFilter={
                Boolean(appliedFilters.search.trim()) ||
                Boolean(appliedFilters.location.trim()) ||
                appliedFilters.vehicleType !== "all"
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
                  userLocation={userLocation}
                  selectedVehicleType={appliedFilters.vehicleType}
                  directionLoading={directionLoadingId === parking._id}
                  onView={() => router.push(`/driver/parkings/${parking._id}`)}
                  onBook={() =>
                    router.push(`/driver/parkings/${parking._id}/book`)
                  }
                  onDirections={() => handleGetDirections(parking)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface ParkingCardProps {
  parking: Parking;
  userLocation: UserLocation | null;
  selectedVehicleType: VehicleFilter;
  directionLoading: boolean;
  onView: () => void;
  onBook: () => void;
  onDirections: () => void;
}

function ParkingCard({
  parking,
  userLocation,
  selectedVehicleType,
  directionLoading,
  onView,
  onBook,
  onDirections,
}: ParkingCardProps) {
  const startingPrice = getStartingPrice(parking, selectedVehicleType);

  const distance = userLocation
    ? getParkingDistance(parking, userLocation.latitude, userLocation.longitude)
    : null;

  const hasCoordinates = getParkingCoordinates(parking) !== null;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/30 bg-white shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-blue-950/30">
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
          <div className="flex h-full items-center justify-center bg-zinc-100">
            <MapPin className="h-10 w-10 text-zinc-300" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-800 shadow-sm">
            {formatParkingType(parking.parkingType)}
          </span>
        </div>

        {distance !== null && distance !== Infinity && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-[#4338ff]/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <Navigation className="h-3.5 w-3.5" />

            {formatDistance(distance)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="line-clamp-2 min-w-0 text-lg font-bold text-zinc-950">
            {parking.parkingName}
          </h2>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              From
            </p>

            {startingPrice.amount !== null ? (
              <p className="text-xl font-black text-[#4338ff]">
                {getCurrencySymbol(parking.pricing?.currency)}
                {formatPrice(startingPrice.amount)}

                <span className="ml-1 text-[10px] font-medium text-zinc-400">
                  /
                  {startingPrice.period === "hour"
                    ? "hr"
                    : startingPrice.period === "day"
                      ? "day"
                      : "month"}
                </span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-zinc-400">
                Price unavailable
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4338ff]">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium leading-5 text-zinc-700">
              {parking.address}
            </p>

            {parking.landmark && (
              <p className="mt-1 text-xs text-zinc-400">
                Near {parking.landmark}
              </p>
            )}

            <p className="mt-1 text-xs text-zinc-400">
              {parking.city}, {parking.state} - {parking.pincode}
            </p>
          </div>
        </div>
        {distance !== null && Number.isFinite(distance) && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
              <Navigation className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Distance from you
              </p>

              <p className="text-sm font-bold text-zinc-900">
                {formatDistance(distance)}
              </p>
            </div>
          </div>
        )}
        {parking.supportedVehicleTypes?.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <Car className="h-4 w-4 text-[#4338ff]" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Vehicles
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {parking.supportedVehicleTypes.map((vehicle) => (
                <span
                  key={vehicle}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedVehicleType === vehicle
                      ? "bg-[#4338ff] text-white"
                      : "bg-blue-100 text-[#4338ff]"
                  }`}
                >
                  {getVehicleLabel(vehicle)}
                </span>
              ))}
            </div>
          </div>
        )}

        {userLocation && distance !== null && distance !== Infinity && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm">
              <Navigation className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Distance from you
              </p>

              <p className="text-sm font-bold text-zinc-800">
                {formatDistance(distance)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-zinc-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm">
              <UserRound className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Parking owner
              </p>

              <p className="truncate text-sm font-semibold text-zinc-800">
                {parking.ownerName || "Owner"}
              </p>
            </div>

            {parking.contactNumber && (
              <a
                href={`tel:${parking.contactNumber}`}
                onClick={(event) => event.stopPropagation()}
                aria-label={`Call ${parking.ownerName || "parking owner"}`}
                title={`Call ${parking.contactNumber}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#4338ff] shadow-sm transition hover:bg-[#4338ff] hover:text-white active:scale-90"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>

          {parking.contactNumber && (
            <p className="mt-2 pl-12 text-xs text-zinc-400">
              {parking.contactNumber}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

            {Number(parking.averageRating || 0).toFixed(1)}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Star className="h-3.5 w-3.5 text-zinc-400" />
            {parking.totalReviews ?? 0} reviews
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock3 className="h-3.5 w-3.5 text-[#4338ff]" />
            {parking.operatingHours?.open ?? "--:--"} -{" "}
            {parking.operatingHours?.close ?? "--:--"}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onView}
            className="group/view flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4338ff] px-3 text-sm font-bold text-white shadow-lg shadow-[#4338ff]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#3730d8] active:scale-[0.98]"
          >
            View parking
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/view:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `/driver/parkings/${parking._id}/book`;
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Car className="h-4 w-4" />
            Book slot
          </button>
        </div>

        <button
          type="button"
          onClick={onDirections}
          disabled={directionLoading || !hasCoordinates}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#4338ff]/15 bg-blue-50 text-sm font-semibold text-[#4338ff] transition duration-200 hover:-translate-y-0.5 hover:bg-[#4338ff] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {directionLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}

          {directionLoading ? "Opening directions..." : "Get directions"}
        </button>
      </div>
    </article>
  );
}

interface NoParkingStateProps {
  hasFilter: boolean;
  location: string;
  onClear: () => void;
}

function NoParkingState({ hasFilter, location, onClear }: NoParkingStateProps) {
  return (
    <div className="mt-8 rounded-3xl border border-white/20 bg-white p-8 text-center text-zinc-900 shadow-2xl sm:p-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#4338ff]">
        <MapPin className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black">No parking locations found</h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
        {hasFilter
          ? `We couldn't find an approved parking location ${
              location ? `in ${location}` : "matching your search"
            }. Try another search.`
          : "There are currently no approved parking locations available."}
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-[#4338ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3730d8] active:scale-95"
      >
        Clear filters
      </button>
    </div>
  );
}

function ParkingSkeletonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 w-72 rounded-lg bg-white/20" />

            <div className="mt-5 h-5 w-full max-w-xl rounded bg-white/15" />

            <div className="mt-8 rounded-3xl bg-white p-3">
              <div className="h-12 rounded-2xl bg-zinc-200" />
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl bg-white"
                >
                  <div className="h-52 bg-zinc-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-2/3 rounded bg-zinc-200" />

                    <div className="h-4 w-full rounded bg-zinc-100" />

                    <div className="h-4 w-1/2 rounded bg-zinc-100" />

                    <div className="h-12 rounded-2xl bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

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

function getParkingCoordinates(parking: Parking): UserLocation | null {
  const latitude = parking.location?.latitude;

  const longitude = parking.location?.longitude;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    return null;
  }

  if (longitude < -180 || longitude > 180) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

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

function haversineDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusKm = 6371;

  const dLatitude = toRadians(latitude2 - latitude1);

  const dLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function formatDistance(distance: number): string {
  if (!Number.isFinite(distance)) {
    return "Distance unavailable";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

function getStartingPrice(
  parking: Parking,
  selectedVehicleType: VehicleFilter = "all",
): StartingPrice {
  const prices: StartingPrice[] = [];

  const vehicleTypes: VehicleType[] =
    selectedVehicleType === "all"
      ? ["twoWheeler", "fourWheeler", "vanMinibus", "heavyVehicle"]
      : [selectedVehicleType];

  for (const vehicleType of vehicleTypes) {
    const pricing = parking.pricing?.[vehicleType];

    if (!pricing) {
      continue;
    }

    if (typeof pricing.hourly === "number" && pricing.hourly >= 0) {
      prices.push({
        amount: pricing.hourly,
        period: "hour",
      });
    }

    if (typeof pricing.daily === "number" && pricing.daily >= 0) {
      prices.push({
        amount: pricing.daily,
        period: "day",
      });
    }

    if (typeof pricing.monthly === "number" && pricing.monthly >= 0) {
      prices.push({
        amount: pricing.monthly,
        period: "month",
      });
    }
  }

  if (prices.length === 0) {
    return {
      amount: null,
      period: null,
    };
  }

  const hourlyPrices = prices.filter((price) => price.period === "hour");

  if (hourlyPrices.length > 0) {
    return {
      amount: Math.min(...hourlyPrices.map((price) => price.amount!)),
      period: "hour",
    };
  }

  const dailyPrices = prices.filter((price) => price.period === "day");

  if (dailyPrices.length > 0) {
    return {
      amount: Math.min(...dailyPrices.map((price) => price.amount!)),
      period: "day",
    };
  }

  const monthlyPrices = prices.filter((price) => price.period === "month");

  if (monthlyPrices.length > 0) {
    return {
      amount: Math.min(...monthlyPrices.map((price) => price.amount!)),
      period: "month",
    };
  }

  return {
    amount: null,
    period: null,
  };
}

function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
}

function getCurrencySymbol(currency?: string): string {
  if (!currency || currency === "INR" || currency === "₹") {
    return "₹";
  }

  if (currency === "USD") {
    return "$";
  }

  if (currency === "EUR") {
    return "€";
  }

  if (currency === "GBP") {
    return "£";
  }

  return `${currency} `;
}

function getVehicleLabel(vehicleType: VehicleType): string {
  switch (vehicleType) {
    case "twoWheeler":
      return "Bike";

    case "fourWheeler":
      return "Car";

    case "vanMinibus":
      return "Van";

    case "heavyVehicle":
      return "Heavy Vehicle";

    default:
      return vehicleType;
  }
}

function formatParkingType(parkingType: string): string {
  switch (parkingType) {
    case "multiLevel":
      return "Multi Level";

    case "fourWheeler":
      return "Four Wheeler";

    case "twoWheeler":
      return "Two Wheeler";

    case "open":
      return "Open";

    case "covered":
      return "Covered";

    case "basement":
      return "Basement";

    case "street":
      return "Street";

    default:
      return parkingType;
  }
}
