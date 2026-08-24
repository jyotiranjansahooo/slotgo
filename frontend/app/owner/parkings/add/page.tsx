"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  ParkingSquare,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OwnerNavbar from "@/components/owner/OwnerNavbar";
import { useAuth } from "@/providers/AuthProvider";

import { createParking } from "@/services/parking.service";
import { getApiErrorMessage } from "@/lib/api-error";

import type { ParkingType } from "@/types/parking";

const PARKING_TYPES: {
  value: ParkingType;
  label: string;
}[] = [
  { value: "open", label: "Open Parking" },
  { value: "covered", label: "Covered Parking" },
  { value: "basement", label: "Basement" },
  { value: "multiLevel", label: "Multi Level" },
  { value: "street", label: "Street Parking" },
];

const FACILITIES = [
  "CCTV",
  "Security Guard",
  "Covered Parking",
  "EV Charging",
  "Lighting",
  "Washroom",
  "Drinking Water",
  "Valet Parking",
  "Disabled Access",
  "Car Wash",
];

const DEFAULT_RULES = [
  "Valid parking booking is required.",
  "Follow parking staff instructions.",
  "Park only in the assigned slot.",
];

interface ImageItem {
  url: string;
  publicId: string;
}

interface FormState {
  parkingName: string;
  description: string;

  parkingType: ParkingType;

  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;

  latitude: string;
  longitude: string;

  ownerName: string;
  contactNumber: string;

  parkingArea: string;

  facilities: string[];
  rules: string[];
  entryInstructions: string;

  hourlyBooking: boolean;
  dailyBooking: boolean;
  monthlyBooking: boolean;

  twoWheelerHourly: string;
  twoWheelerDaily: string;
  twoWheelerMonthly: string;

  fourWheelerHourly: string;
  fourWheelerDaily: string;
  fourWheelerMonthly: string;

  vanHourly: string;
  vanDaily: string;
  vanMonthly: string;

  heavyHourly: string;
  heavyDaily: string;
  heavyMonthly: string;

  currency: string;

  openingTime: string;
  closingTime: string;
}

const initialForm: FormState = {
  parkingName: "",
  description: "",

  parkingType: "open",

  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",

  latitude: "",
  longitude: "",

  ownerName: "",
  contactNumber: "",

  parkingArea: "",

  facilities: [],
  rules: DEFAULT_RULES,

  entryInstructions: "",

  hourlyBooking: true,
  dailyBooking: true,
  monthlyBooking: false,

  twoWheelerHourly: "",
  twoWheelerDaily: "",
  twoWheelerMonthly: "",

  fourWheelerHourly: "",
  fourWheelerDaily: "",
  fourWheelerMonthly: "",

  vanHourly: "",
  vanDaily: "",
  vanMonthly: "",

  heavyHourly: "",
  heavyDaily: "",
  heavyMonthly: "",

  currency: "INR",

  openingTime: "06:00",
  closingTime: "23:00",
};

export default function OwnerAddParkingPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerAddParking />
    </ProtectedRoute>
  );
}

function OwnerAddParking() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<ImageItem[]>([]);

  const [newRule, setNewRule] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ----------------------------------------------------------
   * HELPERS
   * ----------------------------------------------------------
   */

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function toggleFacility(facility: string) {
    setForm((previous) => {
      const exists = previous.facilities.includes(facility);

      return {
        ...previous,
        facilities: exists
          ? previous.facilities.filter((item) => item !== facility)
          : [...previous.facilities, facility],
      };
    });
  }

  function addRule() {
    const rule = newRule.trim();

    if (!rule) {
      return;
    }

    if (form.rules.includes(rule)) {
      setNewRule("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      rules: [...previous.rules, rule],
    }));

    setNewRule("");
  }

  function removeRule(rule: string) {
    setForm((previous) => ({
      ...previous,
      rules: previous.rules.filter((item) => item !== rule),
    }));
  }

  /*
   * ----------------------------------------------------------
   * LIVE LOCATION
   * ----------------------------------------------------------
   */

  function getLiveLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support live location.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", String(position.coords.latitude));
        updateField("longitude", String(position.coords.longitude));

        setLoadingLocation(false);
      },
      (locationError) => {
        setLoadingLocation(false);

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access.",
          );
        } else if (locationError.code === 2) {
          setError("Unable to determine your current location.");
        } else {
          setError("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  /*
   * ----------------------------------------------------------
   * IMAGE URL
   *
   * This keeps the page compatible with your backend's
   * { url, publicId } image structure.
   *
   * Replace the upload function with your existing Cloudinary
   * uploader if you already have one.
   * ----------------------------------------------------------
   */

  function addImage() {
    if (images.length >= 5) {
      setError("Maximum 5 images are allowed.");
      return;
    }

    const url = window.prompt("Enter the parking image URL");

    if (!url) {
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid image URL.");
      return;
    }

    setImages((previous) => [
      ...previous,
      {
        url,
        publicId: `parking-${Date.now()}`,
      },
    ]);

    setError("");
  }

  function removeImage(index: number) {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  /*
   * ----------------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------------
   */

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (form.parkingName.trim().length < 2) {
      errors.push("Parking name is required.");
    }

    if (form.address.trim().length < 5) {
      errors.push("Parking address is required.");
    }

    if (form.city.trim().length < 2) {
      errors.push("City is required.");
    }

    if (form.state.trim().length < 2) {
      errors.push("State is required.");
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      errors.push("Enter a valid 6-digit pincode.");
    }

    if (!form.ownerName.trim()) {
      errors.push("Owner name is required.");
    }

    if (!/^[6-9]\d{9}$/.test(form.contactNumber.trim())) {
      errors.push("Enter a valid 10-digit mobile number.");
    }

    const area = Number(form.parkingArea);

    if (!Number.isFinite(area) || area <= 0) {
      errors.push("Parking area must be greater than 0.");
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      errors.push("Valid latitude is required.");
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      errors.push("Valid longitude is required.");
    }

    if (images.length < 2) {
      errors.push("At least 2 parking images are required.");
    }

    if (images.length > 5) {
      errors.push("Maximum 5 parking images are allowed.");
    }

    if (!form.openingTime || !form.closingTime) {
      errors.push("Opening and closing time are required.");
    }

    if (!form.hourlyBooking && !form.dailyBooking && !form.monthlyBooking) {
      errors.push("Select at least one booking mode.");
    }

    return errors;
  }, [form, images]);

  /*
   * ----------------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------------
   */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        parkingName: form.parkingName.trim(),

        description: form.description.trim(),

        parkingType: form.parkingType,

        address: form.address.trim(),

        landmark: form.landmark.trim() || undefined,

        city: form.city.trim(),

        state: form.state.trim(),

        pincode: form.pincode.trim(),

        location: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },

        ownerName: form.ownerName.trim(),

        contactNumber: form.contactNumber.trim(),

        parkingArea: Number(form.parkingArea),

        facilities: form.facilities,

        rules: form.rules,

        entryInstructions: form.entryInstructions.trim(),

        bookingModes: {
          hourly: form.hourlyBooking,
          daily: form.dailyBooking,
          monthly: form.monthlyBooking,
        },

        pricing: {
          currency: form.currency,

          twoWheeler: {
            hourly: optionalNumber(form.twoWheelerHourly),
            daily: optionalNumber(form.twoWheelerDaily),
            monthly: optionalNumber(form.twoWheelerMonthly),
          },

          fourWheeler: {
            hourly: optionalNumber(form.fourWheelerHourly),
            daily: optionalNumber(form.fourWheelerDaily),
            monthly: optionalNumber(form.fourWheelerMonthly),
          },

          vanMinibus: {
            hourly: optionalNumber(form.vanHourly),
            daily: optionalNumber(form.vanDaily),
            monthly: optionalNumber(form.vanMonthly),
          },

          heavyVehicle: {
            hourly: optionalNumber(form.heavyHourly),
            daily: optionalNumber(form.heavyDaily),
            monthly: optionalNumber(form.heavyMonthly),
          },
        },

        images,

        operatingHours: {
          open: form.openingTime,
          close: form.closingTime,
        },
      };

      await createParking(payload);

      setSuccess("Parking created successfully.");

      setTimeout(() => {
        router.push("/owner/parkings");
        router.refresh();
      }, 700);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06544E] text-white">
      <OwnerNavbar />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        {/* HEADER */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/owner/parkings")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to parkings
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#06544E] shadow-xl">
              <ParkingSquare className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm text-white/45">Parking management</p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Add parking
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Add complete parking information before creating parking slots.
                Accurate location, contact details, images and operating hours
                are required.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ====================================================
              BASIC INFORMATION
             ==================================================== */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Basic parking information"
            description="Tell customers what this parking location is."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Parking name"
                required
                value={form.parkingName}
                onChange={(value) => updateField("parkingName", value)}
                placeholder="e.g. City Center Parking"
              />

              <Select
                label="Parking type"
                value={form.parkingType}
                onChange={(value) =>
                  updateField("parkingType", value as ParkingType)
                }
                options={PARKING_TYPES}
              />
            </div>

            <TextArea
              label="Description"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Describe your parking facility..."
            />
          </FormSection>

          {/* ====================================================
              OWNER
             ==================================================== */}

          <FormSection
            icon={<User className="h-5 w-5" />}
            title="Owner contact details"
            description="Customers may need these details for parking-related communication."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Owner name"
                required
                value={form.ownerName}
                onChange={(value) => updateField("ownerName", value)}
                placeholder="Full owner name"
                icon={<User className="h-4 w-4" />}
              />

              <Input
                label="Contact number"
                required
                value={form.contactNumber}
                onChange={(value) =>
                  updateField(
                    "contactNumber",
                    value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                placeholder="10-digit mobile number"
                inputMode="numeric"
                icon={<Phone className="h-4 w-4" />}
              />
            </div>
          </FormSection>

          {/* ====================================================
              LOCATION
             ==================================================== */}

          <FormSection
            icon={<MapPin className="h-5 w-5" />}
            title="Parking location"
            description="Your parking location must have a valid live/map coordinate."
          >
            <TextArea
              label="Address"
              required
              value={form.address}
              onChange={(value) => updateField("address", value)}
              placeholder="Complete parking address"
            />

            <div className="grid gap-5 md:grid-cols-3">
              <Input
                label="Landmark"
                value={form.landmark}
                onChange={(value) => updateField("landmark", value)}
                placeholder="Near railway station"
              />

              <Input
                label="City"
                required
                value={form.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Bhubaneswar"
              />

              <Input
                label="State"
                required
                value={form.state}
                onChange={(value) => updateField("state", value)}
                placeholder="Odisha"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Input
                label="Pincode"
                required
                value={form.pincode}
                onChange={(value) =>
                  updateField("pincode", value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="751001"
                inputMode="numeric"
              />

              <Input
                label="Latitude"
                required
                value={form.latitude}
                onChange={(value) => updateField("latitude", value)}
                placeholder="20.2961"
              />

              <Input
                label="Longitude"
                required
                value={form.longitude}
                onChange={(value) => updateField("longitude", value)}
                placeholder="85.8245"
              />
            </div>

            <button
              type="button"
              onClick={getLiveLocation}
              disabled={loadingLocation}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}

              {loadingLocation ? "Getting location..." : "Use my live location"}
            </button>
          </FormSection>

          {/* ====================================================
              PARKING AREA
             ==================================================== */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Parking area"
            description="Enter the approximate total parking area."
          >
            <div className="max-w-md">
              <Input
                label="Parking area"
                required
                value={form.parkingArea}
                onChange={(value) =>
                  updateField("parkingArea", value.replace(/[^0-9.]/g, ""))
                }
                placeholder="e.g. 2500"
                type="number"
                suffix="sq ft"
              />
            </div>
          </FormSection>

          {/* ====================================================
              IMAGES
             ==================================================== */}

          <FormSection
            icon={<ImagePlus className="h-5 w-5" />}
            title="Parking images"
            description="Add 2 to 5 clear images of the actual parking location."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                >
                  <img
                    src={image.url}
                    alt={`Parking image ${index + 1}`}
                    className="h-48 w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-xs text-white/80">Image {index + 1}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={addImage}
                  className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] text-white/50 transition hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
                >
                  <ImagePlus className="h-8 w-8" />

                  <span className="mt-3 text-sm font-semibold">Add image</span>

                  <span className="mt-1 text-xs">{images.length}/5 images</span>
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-white/40">
              Minimum 2 images and maximum 5 images are required.
            </p>
          </FormSection>

          {/* ====================================================
              FACILITIES
             ==================================================== */}

          <FormSection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Facilities"
            description="Select everything available at your parking location."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FACILITIES.map((facility) => {
                const selected = form.facilities.includes(facility);

                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={
                      selected
                        ? "flex items-center gap-3 rounded-xl border border-white/20 bg-white text-left px-4 py-3 text-sm font-semibold text-[#06544E]"
                        : "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                    }
                  >
                    <span
                      className={
                        selected
                          ? "flex h-5 w-5 items-center justify-center rounded-md bg-[#06544E] text-white"
                          : "flex h-5 w-5 items-center justify-center rounded-md border border-white/20"
                      }
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>

                    {facility}
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* ====================================================
              RULES
             ==================================================== */}

          <FormSection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Parking rules"
            description="Set clear rules customers should follow."
          >
            <div className="flex gap-2">
              <input
                value={newRule}
                onChange={(event) => setNewRule(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addRule();
                  }
                }}
                placeholder="Enter a parking rule"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
              />

              <button
                type="button"
                onClick={addRule}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#06544E]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {form.rules.map((rule) => (
                <div
                  key={rule}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <span className="text-sm text-white/70">{rule}</span>

                  <button
                    type="button"
                    onClick={() => removeRule(rule)}
                    className="shrink-0 text-white/30 transition hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </FormSection>

          {/* ====================================================
              ENTRY INSTRUCTIONS
             ==================================================== */}

          <FormSection
            icon={<Navigation className="h-5 w-5" />}
            title="Entry instructions"
            description="Help customers find the entrance and park correctly."
          >
            <TextArea
              label="Instructions"
              value={form.entryInstructions}
              onChange={(value) => updateField("entryInstructions", value)}
              placeholder="Enter through the main gate. Show your booking confirmation to security..."
            />
          </FormSection>

          {/* ====================================================
              OPERATING HOURS
             ==================================================== */}

          <FormSection
            icon={<Clock3 className="h-5 w-5" />}
            title="Operating hours"
            description="When can customers use your parking?"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Opening time"
                required
                type="time"
                value={form.openingTime}
                onChange={(value) => updateField("openingTime", value)}
              />

              <Input
                label="Closing time"
                required
                type="time"
                value={form.closingTime}
                onChange={(value) => updateField("closingTime", value)}
              />
            </div>
          </FormSection>

          {/* ====================================================
              BOOKING MODES
             ==================================================== */}

          <FormSection
            icon={<Clock3 className="h-5 w-5" />}
            title="Booking modes"
            description="Choose how customers can book your parking."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle
                label="Hourly"
                checked={form.hourlyBooking}
                onChange={(value) => updateField("hourlyBooking", value)}
              />

              <Toggle
                label="Daily"
                checked={form.dailyBooking}
                onChange={(value) => updateField("dailyBooking", value)}
              />

              <Toggle
                label="Monthly"
                checked={form.monthlyBooking}
                onChange={(value) => updateField("monthlyBooking", value)}
              />
            </div>
          </FormSection>

          {/* ====================================================
              PRICING
             ==================================================== */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Parking pricing"
            description="Set optional hourly, daily and monthly prices."
          >
            <div className="mb-5 max-w-xs">
              <Input
                label="Currency"
                value={form.currency}
                onChange={(value) =>
                  updateField("currency", value.toUpperCase())
                }
                placeholder="INR"
              />
            </div>

            <div className="space-y-5">
              <PricingRow
                title="Two Wheeler"
                hourly={form.twoWheelerHourly}
                daily={form.twoWheelerDaily}
                monthly={form.twoWheelerMonthly}
                onHourly={(value) => updateField("twoWheelerHourly", value)}
                onDaily={(value) => updateField("twoWheelerDaily", value)}
                onMonthly={(value) => updateField("twoWheelerMonthly", value)}
              />

              <PricingRow
                title="Four Wheeler"
                hourly={form.fourWheelerHourly}
                daily={form.fourWheelerDaily}
                monthly={form.fourWheelerMonthly}
                onHourly={(value) => updateField("fourWheelerHourly", value)}
                onDaily={(value) => updateField("fourWheelerDaily", value)}
                onMonthly={(value) => updateField("fourWheelerMonthly", value)}
              />

              <PricingRow
                title="Van / Minibus"
                hourly={form.vanHourly}
                daily={form.vanDaily}
                monthly={form.vanMonthly}
                onHourly={(value) => updateField("vanHourly", value)}
                onDaily={(value) => updateField("vanDaily", value)}
                onMonthly={(value) => updateField("vanMonthly", value)}
              />

              <PricingRow
                title="Heavy Vehicle"
                hourly={form.heavyHourly}
                daily={form.heavyDaily}
                monthly={form.heavyMonthly}
                onHourly={(value) => updateField("heavyHourly", value)}
                onDaily={(value) => updateField("heavyDaily", value)}
                onMonthly={(value) => updateField("heavyMonthly", value)}
              />
            </div>
          </FormSection>

          {/* ====================================================
              SUBMIT
             ==================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/owner/parkings")}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#06544E] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating parking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create parking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * FORM SECTION
 * =============================================================
 */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-xl backdrop-blur-xl sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-semibold">{title}</h2>

          <p className="mt-1 text-sm text-white/40">{description}</p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

/*
 * =============================================================
 * INPUT
 * =============================================================
 */

function Input({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  icon,
  suffix,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  icon?: React.ReactNode;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}

        {required && <span className="ml-1 text-red-300">*</span>}
      </span>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.07] ${
            icon ? "pl-11" : "px-4"
          } ${suffix ? "pr-20" : ""}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

/*
 * =============================================================
 * TEXTAREA
 * =============================================================
 */

function TextArea({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}

        {required && <span className="ml-1 text-red-300">*</span>}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.07]"
      />
    </label>
  );
}

/*
 * =============================================================
 * SELECT
 * =============================================================
 */

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#0a625b] px-4 pr-10 text-sm text-white outline-none transition focus:border-white/30"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#06544E] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      </div>
    </label>
  );
}

/*
 * =============================================================
 * TOGGLE
 * =============================================================
 */

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        checked
          ? "flex items-center justify-between rounded-xl border border-white/20 bg-white px-4 py-4 text-left text-sm font-semibold text-[#06544E]"
          : "flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm text-white/50 transition hover:bg-white/[0.08]"
      }
    >
      {label}

      <span
        className={
          checked
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#06544E] text-white"
            : "h-6 w-6 rounded-full border border-white/20"
        }
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

/*
 * =============================================================
 * PRICING ROW
 * =============================================================
 */

function PricingRow({
  title,
  hourly,
  daily,
  monthly,
  onHourly,
  onDaily,
  onMonthly,
}: {
  title: string;
  hourly: string;
  daily: string;
  monthly: string;
  onHourly: (value: string) => void;
  onDaily: (value: string) => void;
  onMonthly: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-4 text-sm font-semibold text-white">{title}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Hourly"
          value={hourly}
          onChange={onHourly}
          type="number"
          placeholder="₹ 0"
        />

        <Input
          label="Daily"
          value={daily}
          onChange={onDaily}
          type="number"
          placeholder="₹ 0"
        />

        <Input
          label="Monthly"
          value={monthly}
          onChange={onMonthly}
          type="number"
          placeholder="₹ 0"
        />
      </div>
    </div>
  );
}

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}
