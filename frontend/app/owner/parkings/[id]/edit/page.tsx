"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Car,
  Check,
  Clock3,
  Crosshair,
  ImageIcon,
  Loader2,
  MapPin,
  ParkingSquare,
  Save,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  User,
} from "lucide-react";

import OwnerNavbar from "@/components/owner/OwnerNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getParking,
  updateParking,
  type UpdateParkingPayload,
} from "@/services/parking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { Parking, ParkingImage, ParkingType } from "@/types/parking";

export default function EditParkingPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <EditParking />
    </ProtectedRoute>
  );
}

const FACILITIES = [
  {
    value: "cctv",
    label: "CCTV",
  },
  {
    value: "security_guard",
    label: "Security Guard",
  },
  {
    value: "covered_parking",
    label: "Covered Parking",
  },
  {
    value: "ev_charging",
    label: "EV Charging",
  },
  {
    value: "lighting",
    label: "Lighting",
  },
  {
    value: "washroom",
    label: "Washroom",
  },
  {
    value: "drinking_water",
    label: "Drinking Water",
  },
  {
    value: "valet_parking",
    label: "Valet Parking",
  },
  {
    value: "disabled_access",
    label: "Disabled Access",
  },
  {
    value: "car_wash",
    label: "Car Wash",
  },
] as const;

type FacilityValue = (typeof FACILITIES)[number]["value"];

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

function EditParking() {
  const router = useRouter();
  const params = useParams();

  const parkingId = String(params.id);

  const parkingQuery = useQuery({
    queryKey: ["owner", "parking", parkingId],
    queryFn: () => getParking(parkingId),
    enabled: Boolean(parkingId),
    staleTime: 30 * 1000,
  });

  if (parkingQuery.isLoading) {
    return <EditParkingLoading />;
  }

  if (parkingQuery.isError) {
    return (
      <EditParkingError
        message={getApiErrorMessage(parkingQuery.error)}
        onBack={() => router.push("/owner/parkings")}
        onRetry={() => parkingQuery.refetch()}
      />
    );
  }

  const parking = parkingQuery.data;

  if (!parking) {
    return (
      <EditParkingError
        message="Parking location could not be found."
        onBack={() => router.push("/owner/parkings")}
        onRetry={() => parkingQuery.refetch()}
      />
    );
  }

  return (
    <EditParkingForm
      key={parking._id}
      parking={parking}
      parkingId={parkingId}
    />
  );
}

/*
|--------------------------------------------------------------------------
| EDIT FORM
|--------------------------------------------------------------------------
*/

function EditParkingForm({
  parking,
  parkingId,
}: {
  parking: Parking;
  parkingId: string;
}) {
  const router = useRouter();

  const [form, setForm] = useState<EditParkingFormState>(() =>
    parkingToForm(parking),
  );

  const [existingImages, setExistingImages] = useState<ParkingImage[]>(
    () => parking.images ?? [],
  );

  const [newImages, setNewImages] = useState<File[]>([]);

  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const [locationMessage, setLocationMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | UPDATE MUTATION
  |--------------------------------------------------------------------------
  */

  const updateMutation = useMutation({
    mutationFn: ({
      payload,
      images,
    }: {
      payload: UpdateParkingPayload;
      images: File[];
    }) => updateParking(parkingId, payload, images),

    onSuccess: () => {
      router.push("/owner/parkings");
      router.refresh();
    },
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  function updateField<K extends keyof EditParkingFormState>(
    field: K,
    value: EditParkingFormState[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | CURRENT LOCATION
  |--------------------------------------------------------------------------
  */

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by this browser.");

      return;
    }

    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((previous) => ({
          ...previous,
          latitude: String(latitude),
          longitude: String(longitude),
        }));

        setLocationMessage("Current location selected successfully.");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationMessage(
              "Location permission was denied. Please allow location access.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationMessage("Your location could not be determined.");
            break;

          case error.TIMEOUT:
            setLocationMessage("Location request timed out. Please try again.");
            break;

          default:
            setLocationMessage("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE UPLOAD
  |--------------------------------------------------------------------------
  */

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setNewImages((previous) => [...previous, ...files]);

    event.target.value = "";
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE NEW IMAGE
  |--------------------------------------------------------------------------
  */

  function removeNewImage(index: number) {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE EXISTING IMAGE
  |--------------------------------------------------------------------------
  */

  function removeExistingImage(publicId: string) {
    setExistingImages((previous) =>
      previous.filter((image) => image.publicId !== publicId),
    );

    setRemovedImageIds((previous) =>
      previous.includes(publicId) ? previous : [...previous, publicId],
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const parkingArea = Number(form.parkingArea);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setLocationMessage("Please enter a valid latitude and longitude.");

      return;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setLocationMessage(
        "Latitude must be between -90 and 90 and longitude between -180 and 180.",
      );

      return;
    }

    if (!Number.isFinite(parkingArea) || parkingArea <= 0) {
      return;
    }

    /*
     * IMPORTANT:
     * form.facilities already contains backend enum values.
     *
     * Example:
     *
     * ["cctv", "security_guard", "lighting"]
     *
     * NOT:
     *
     * ["CCTV", "Security Guard", "Lighting"]
     */

    const facilities = form.facilities.filter(isValidFacility);

    const payload: UpdateParkingPayload = {
      parkingName: form.parkingName.trim(),

      description: form.description.trim(),

      parkingType: form.parkingType,

      address: form.address.trim(),

      landmark: form.landmark.trim() || undefined,

      city: form.city.trim(),

      state: form.state.trim(),

      pincode: form.pincode.trim(),

      location: {
        latitude,
        longitude,
      },

      ownerName: form.ownerName.trim(),

      contactNumber: form.contactNumber.trim(),

      parkingArea,

      facilities,

      rules: parseCommaSeparated(form.rules),

      entryInstructions: form.entryInstructions.trim() || undefined,

      bookingModes: {
        hourly: form.bookingHourly,
        daily: form.bookingDaily,
        monthly: form.bookingMonthly,
      },

      pricing: {
        currency: form.currency.trim() || "INR",

        twoWheeler: {
          hourly: numberOrUndefined(form.twoWheelerHourly),
          daily: numberOrUndefined(form.twoWheelerDaily),
          monthly: numberOrUndefined(form.twoWheelerMonthly),
        },

        fourWheeler: {
          hourly: numberOrUndefined(form.fourWheelerHourly),
          daily: numberOrUndefined(form.fourWheelerDaily),
          monthly: numberOrUndefined(form.fourWheelerMonthly),
        },

        vanMinibus: {
          hourly: numberOrUndefined(form.vanHourly),
          daily: numberOrUndefined(form.vanDaily),
          monthly: numberOrUndefined(form.vanMonthly),
        },

        heavyVehicle: {
          hourly: numberOrUndefined(form.heavyHourly),
          daily: numberOrUndefined(form.heavyDaily),
          monthly: numberOrUndefined(form.heavyMonthly),
        },
      },

      operatingHours: {
        open: form.open,
        close: form.close,
      },

      removeImagePublicIds: removedImageIds,
    };

    updateMutation.mutate({
      payload,
      images: newImages,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06544E] text-white">
      <OwnerNavbar />

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.025)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.025)_50%,rgba(255,255,255,0.025)_75%,transparent_75%)] bg-[length:90px_90px]" />

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-teal-300/5 blur-[130px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* HEADER */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/owner/parkings")}
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to parkings
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <ParkingSquare className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-white/45">Parking management</p>

              <h1 className="text-3xl font-bold tracking-tight">
                Edit parking
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Update the information for{" "}
            <span className="font-semibold text-white/80">
              {parking.parkingName || "this parking"}
            </span>
            .
          </p>
        </div>

        {/* ERROR */}

        {updateMutation.isError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />

            <div>
              <p className="text-sm font-semibold text-red-100">
                Failed to update parking
              </p>

              <p className="mt-1 text-sm text-red-200/65">
                {getApiErrorMessage(updateMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Basic information"
            description="Update the main information about your parking."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Parking name"
                value={form.parkingName}
                onChange={(value) => updateField("parkingName", value)}
                required
              />

              <SelectField
                label="Parking type"
                value={form.parkingType}
                onChange={(value) => updateField("parkingType", value)}
                options={[
                  {
                    value: "open",
                    label: "Open",
                  },
                  {
                    value: "covered",
                    label: "Covered",
                  },
                  {
                    value: "basement",
                    label: "Basement",
                  },
                  {
                    value: "multiLevel",
                    label: "Multi Level",
                  },
                  {
                    value: "street",
                    label: "Street",
                  },
                ]}
              />
            </div>

            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              rows={4}
              required
            />
          </FormSection>

          {/* LOCATION */}

          <FormSection
            icon={<MapPin className="h-5 w-5" />}
            title="Location"
            description="Change the parking address or choose a new location."
          >
            <TextAreaField
              label="Address"
              value={form.address}
              onChange={(value) => updateField("address", value)}
              rows={3}
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Landmark"
                value={form.landmark}
                onChange={(value) => updateField("landmark", value)}
              />

              <InputField
                label="City"
                value={form.city}
                onChange={(value) => updateField("city", value)}
                required
              />

              <InputField
                label="State"
                value={form.state}
                onChange={(value) => updateField("state", value)}
                required
              />

              <InputField
                label="Pincode"
                value={form.pincode}
                onChange={(value) => updateField("pincode", value)}
                required
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Parking coordinates</h3>

                  <p className="mt-1 text-xs text-white/40">
                    Choose the current GPS location or enter coordinates
                    manually.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#06544E] transition hover:bg-emerald-200"
                >
                  <Crosshair className="h-4 w-4" />
                  Use my location
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(value) => updateField("latitude", value)}
                  required
                />

                <InputField
                  label="Longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(value) => updateField("longitude", value)}
                  required
                />
              </div>

              {locationMessage && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-300/5 p-3 text-xs text-emerald-100/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{locationMessage}</span>
                </div>
              )}
            </div>
          </FormSection>

          {/* CONTACT */}

          <FormSection
            icon={<User className="h-5 w-5" />}
            title="Contact information"
            description="Update the contact information shown to drivers."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Owner name"
                value={form.ownerName}
                onChange={(value) => updateField("ownerName", value)}
                required
              />

              <InputField
                label="Contact number"
                value={form.contactNumber}
                onChange={(value) => updateField("contactNumber", value)}
                required
              />
            </div>
          </FormSection>

          {/* PARKING DETAILS */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Parking details"
            description="Update area, facilities and parking rules."
          >
            <InputField
              label="Parking area"
              type="number"
              min="1"
              step="any"
              value={form.parkingArea}
              onChange={(value) => updateField("parkingArea", value)}
              required
            />

            <FacilitySelector
              value={form.facilities}
              onChange={(value) => updateField("facilities", value)}
            />

            <TextAreaField
              label="Rules"
              value={form.rules}
              onChange={(value) => updateField("rules", value)}
              placeholder="No smoking, Carry valid documents..."
              rows={3}
            />

            <TextAreaField
              label="Entry instructions"
              value={form.entryInstructions}
              onChange={(value) => updateField("entryInstructions", value)}
              placeholder="Enter through the main gate..."
              rows={3}
            />
          </FormSection>

          {/* BOOKING MODES */}

          <FormSection
            icon={<Clock3 className="h-5 w-5" />}
            title="Booking modes"
            description="Choose which booking durations drivers can use."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <CheckboxField
                label="Hourly"
                checked={form.bookingHourly}
                onChange={(value) => updateField("bookingHourly", value)}
              />

              <CheckboxField
                label="Daily"
                checked={form.bookingDaily}
                onChange={(value) => updateField("bookingDaily", value)}
              />

              <CheckboxField
                label="Monthly"
                checked={form.bookingMonthly}
                onChange={(value) => updateField("bookingMonthly", value)}
              />
            </div>
          </FormSection>

          {/* PRICING */}

          <FormSection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Vehicle pricing"
            description="Set separate prices for every vehicle type."
          >
            <InputField
              label="Currency"
              value={form.currency}
              onChange={(value) => updateField("currency", value)}
              required
            />

            <VehiclePricingSection
              icon={<Car className="h-5 w-5" />}
              title="Two wheeler"
              hourly={form.twoWheelerHourly}
              daily={form.twoWheelerDaily}
              monthly={form.twoWheelerMonthly}
              onHourly={(value) => updateField("twoWheelerHourly", value)}
              onDaily={(value) => updateField("twoWheelerDaily", value)}
              onMonthly={(value) => updateField("twoWheelerMonthly", value)}
            />

            <VehiclePricingSection
              icon={<Car className="h-5 w-5" />}
              title="Four wheeler"
              hourly={form.fourWheelerHourly}
              daily={form.fourWheelerDaily}
              monthly={form.fourWheelerMonthly}
              onHourly={(value) => updateField("fourWheelerHourly", value)}
              onDaily={(value) => updateField("fourWheelerDaily", value)}
              onMonthly={(value) => updateField("fourWheelerMonthly", value)}
            />

            <VehiclePricingSection
              icon={<Truck className="h-5 w-5" />}
              title="Van / Minibus"
              hourly={form.vanHourly}
              daily={form.vanDaily}
              monthly={form.vanMonthly}
              onHourly={(value) => updateField("vanHourly", value)}
              onDaily={(value) => updateField("vanDaily", value)}
              onMonthly={(value) => updateField("vanMonthly", value)}
            />

            <VehiclePricingSection
              icon={<Truck className="h-5 w-5" />}
              title="Heavy vehicle"
              hourly={form.heavyHourly}
              daily={form.heavyDaily}
              monthly={form.heavyMonthly}
              onHourly={(value) => updateField("heavyHourly", value)}
              onDaily={(value) => updateField("heavyDaily", value)}
              onMonthly={(value) => updateField("heavyMonthly", value)}
            />
          </FormSection>

          {/* OPERATING HOURS */}

          <FormSection
            icon={<Clock3 className="h-5 w-5" />}
            title="Operating hours"
            description="Update when the parking opens and closes."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Opening time"
                type="time"
                value={form.open}
                onChange={(value) => updateField("open", value)}
                required
              />

              <InputField
                label="Closing time"
                type="time"
                value={form.close}
                onChange={(value) => updateField("close", value)}
                required
              />
            </div>
          </FormSection>

          {/* IMAGES */}

          <FormSection
            icon={<ImageIcon className="h-5 w-5" />}
            title="Parking images"
            description="Add new images or remove existing parking images."
          >
            {/* EXISTING */}

            {existingImages.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">
                  Existing images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {existingImages.map((image) => (
                    <div
                      key={image.publicId}
                      className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20"
                    >
                      <img
                        src={image.url}
                        alt="Parking"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.publicId)}
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/80 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGES */}

            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-10 text-center transition hover:border-emerald-300/40 hover:bg-white/[0.05]">
                <Upload className="h-8 w-8 text-emerald-200" />

                <span className="mt-3 text-sm font-semibold">
                  Add parking images
                </span>

                <span className="mt-1 text-xs text-white/40">
                  JPG, PNG or WebP
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {newImages.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-white/70">
                    New images
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {newImages.map((file, index) => (
                      <NewImagePreview
                        key={`${file.name}-${file.lastModified}-${index}`}
                        file={file}
                        onRemove={() => removeNewImage(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* ACTIONS */}

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#06544E]/90 p-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/owner/parkings")}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#06544E] shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| FORM STATE
|--------------------------------------------------------------------------
*/

type EditParkingFormState = {
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

  facilities: FacilityValue[];

  rules: string;
  entryInstructions: string;

  bookingHourly: boolean;
  bookingDaily: boolean;
  bookingMonthly: boolean;

  currency: string;

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

  open: string;
  close: string;
};

/*
|--------------------------------------------------------------------------
| PARKING -> FORM
|--------------------------------------------------------------------------
*/

function parkingToForm(parking: Parking): EditParkingFormState {
  return {
    parkingName: parking.parkingName ?? "",

    description: parking.description ?? "",

    parkingType: parking.parkingType ?? "open",

    address: parking.address ?? "",

    landmark: parking.landmark ?? "",

    city: parking.city ?? "",

    state: parking.state ?? "",

    pincode: parking.pincode ?? "",

    latitude:
      parking.location?.latitude !== undefined
        ? String(parking.location.latitude)
        : "",

    longitude:
      parking.location?.longitude !== undefined
        ? String(parking.location.longitude)
        : "",

    ownerName: parking.ownerName ?? "",

    contactNumber: parking.contactNumber ?? "",

    parkingArea:
      parking.parkingArea !== undefined ? String(parking.parkingArea) : "",

    /*
     * Normalize facilities coming from the API.
     *
     * This also protects you if old database records
     * contain labels such as "CCTV" instead of "cctv".
     */
    facilities: normalizeFacilities(parking.facilities),

    rules: Array.isArray(parking.rules) ? parking.rules.join(", ") : "",

    entryInstructions: parking.entryInstructions ?? "",

    bookingHourly: parking.bookingModes?.hourly ?? true,

    bookingDaily: parking.bookingModes?.daily ?? false,

    bookingMonthly: parking.bookingModes?.monthly ?? false,

    currency: parking.pricing?.currency ?? "INR",

    twoWheelerHourly: priceToString(parking.pricing?.twoWheeler?.hourly),

    twoWheelerDaily: priceToString(parking.pricing?.twoWheeler?.daily),

    twoWheelerMonthly: priceToString(parking.pricing?.twoWheeler?.monthly),

    fourWheelerHourly: priceToString(parking.pricing?.fourWheeler?.hourly),

    fourWheelerDaily: priceToString(parking.pricing?.fourWheeler?.daily),

    fourWheelerMonthly: priceToString(parking.pricing?.fourWheeler?.monthly),

    vanHourly: priceToString(parking.pricing?.vanMinibus?.hourly),

    vanDaily: priceToString(parking.pricing?.vanMinibus?.daily),

    vanMonthly: priceToString(parking.pricing?.vanMinibus?.monthly),

    heavyHourly: priceToString(parking.pricing?.heavyVehicle?.hourly),

    heavyDaily: priceToString(parking.pricing?.heavyVehicle?.daily),

    heavyMonthly: priceToString(parking.pricing?.heavyVehicle?.monthly),

    open: parking.operatingHours?.open ?? "",

    close: parking.operatingHours?.close ?? "",
  };
}

/*
|--------------------------------------------------------------------------
| FACILITY NORMALIZATION
|--------------------------------------------------------------------------
|
| Backend accepts ONLY these values:
|
| cctv
| security_guard
| covered_parking
| ev_charging
| lighting
| washroom
| drinking_water
| valet_parking
| disabled_access
| car_wash
|
*/

function normalizeFacilities(facilities: unknown): FacilityValue[] {
  if (!Array.isArray(facilities)) {
    return [];
  }

  const aliases: Record<string, FacilityValue> = {
    cctv: "cctv",
    CCTV: "cctv",

    security_guard: "security_guard",
    "Security Guard": "security_guard",
    security: "security_guard",

    covered_parking: "covered_parking",
    "Covered Parking": "covered_parking",

    ev_charging: "ev_charging",
    "EV Charging": "ev_charging",

    lighting: "lighting",
    Lighting: "lighting",

    washroom: "washroom",
    Washroom: "washroom",

    drinking_water: "drinking_water",
    "Drinking Water": "drinking_water",

    valet_parking: "valet_parking",
    "Valet Parking": "valet_parking",

    disabled_access: "disabled_access",
    "Disabled Access": "disabled_access",

    car_wash: "car_wash",
    "Car Wash": "car_wash",
  };

  return facilities
    .map((facility) => {
      if (typeof facility !== "string") {
        return null;
      }

      return aliases[facility] ?? null;
    })
    .filter((facility): facility is FacilityValue => facility !== null);
}

function isValidFacility(value: string): value is FacilityValue {
  return FACILITIES.some((facility) => facility.value === value);
}

/*
|--------------------------------------------------------------------------
| FACILITY SELECTOR
|--------------------------------------------------------------------------
*/

function FacilitySelector({
  value,
  onChange,
}: {
  value: FacilityValue[];
  onChange: (value: FacilityValue[]) => void;
}) {
  function toggleFacility(facility: FacilityValue) {
    if (value.includes(facility)) {
      onChange(value.filter((item) => item !== facility));
    } else {
      onChange([...value, facility]);
    }
  }

  return (
    <div>
      <div className="mb-3">
        <span className="block text-sm font-medium text-white/70">
          Facilities
        </span>

        <p className="mt-1 text-xs text-white/40">
          Select the facilities available at your parking.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FACILITIES.map((facility) => {
          const selected = value.includes(facility.value);

          return (
            <button
              key={facility.value}
              type="button"
              onClick={() => toggleFacility(facility.value)}
              className={[
                "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                selected
                  ? "border-emerald-300/30 bg-emerald-300/10"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                  selected
                    ? "border-emerald-300 bg-emerald-300 text-[#06544E]"
                    : "border-white/20 bg-white/5",
                ].join(" ")}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
              </span>

              <span className="text-sm font-medium text-white/75">
                {facility.label}
              </span>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="mt-3 text-xs text-emerald-200/60">
          {value.length} {value.length === 1 ? "facility" : "facilities"}{" "}
          selected
        </p>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| VEHICLE PRICING
|--------------------------------------------------------------------------
*/

function VehiclePricingSection({
  icon,
  title,
  hourly,
  daily,
  monthly,
  onHourly,
  onDaily,
  onMonthly,
}: {
  icon: ReactNode;
  title: string;
  hourly: string;
  daily: string;
  monthly: string;
  onHourly: (value: string) => void;
  onDaily: (value: string) => void;
  onMonthly: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-100">
          {icon}
        </div>

        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <InputField
          label="Hourly"
          type="number"
          min="0"
          step="any"
          value={hourly}
          onChange={onHourly}
        />

        <InputField
          label="Daily"
          type="number"
          min="0"
          step="any"
          value={daily}
          onChange={onDaily}
        />

        <InputField
          label="Monthly"
          type="number"
          min="0"
          step="any"
          value={monthly}
          onChange={onMonthly}
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FORM SECTION
|--------------------------------------------------------------------------
*/

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-100">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-semibold">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-white/40">{description}</p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}

        {required && <span className="ml-1 text-emerald-200">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="h-11 w-full rounded-xl border border-white/10 bg-black/10 px-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-emerald-200/30 focus:bg-white/[0.06]"
      />
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: ParkingType;
  onChange: (value: ParkingType) => void;
  options: {
    value: ParkingType;
    label: string;
  }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ParkingType)}
        className="h-11 w-full rounded-xl border border-white/10 bg-[#064c47] px-3.5 text-sm text-white outline-none transition focus:border-emerald-200/30"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#064c47]"
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| TEXTAREA
|--------------------------------------------------------------------------
*/

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">
        {label}

        {required && <span className="ml-1 text-emerald-200">*</span>}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/10 px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 transition focus:border-emerald-200/30 focus:bg-white/[0.06]"
      />
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| CHECKBOX
|--------------------------------------------------------------------------
*/

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-400"
      />

      <span className="text-sm font-medium text-white/75">{label}</span>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| NEW IMAGE PREVIEW
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We do NOT call setState() inside useEffect.
|
| URL.createObjectURL() is derived directly from `file`.
| useMemo creates the URL.
| useEffect only performs cleanup.
|
*/

function NewImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const preview = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <img
        src={preview}
        alt={file.name}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/80 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
        title="Remove image"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1.5 text-[10px] text-white/80">
        {file.name}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function priceToString(value: number | undefined): string {
  return value !== undefined ? String(value) : "";
}

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function EditParkingLoading() {
  return (
    <main className="min-h-screen bg-[#06544E] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-32 rounded bg-white/10" />

        <div className="mt-5 h-10 w-56 rounded-xl bg-white/10" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/10" />

        <div className="mt-8 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-48 rounded-[1.75rem] bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

function EditParkingError({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06544E] px-4 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertCircle className="h-7 w-7 text-red-200" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">Unable to load parking</h1>

        <p className="mt-2 text-sm leading-6 text-white/50">{message}</p>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#06544E]"
          >
            <Check className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
