"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type ElementType,
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Bike,
  Bus,
  Car,
  Check,
  CheckCircle2,
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
  Truck,
  User,
  X,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OwnerNavbar from "@/components/owner/OwnerNavbar";

import {
  createParking,
  type CreateParkingPayload,
} from "@/services/parking.service";

import { getApiErrorMessage } from "@/lib/api-error";

import type { ParkingType } from "@/types/parking";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_IMAGES = 5;
const MIN_IMAGES = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PARKING_TYPES: {
  value: ParkingType;
  label: string;
}[] = [
  {
    value: "open",
    label: "Open Parking",
  },
  {
    value: "covered",
    label: "Covered Parking",
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
    label: "Street Parking",
  },
];

const FACILITIES = [
  {
    value: "cctv",
    label: "CCTV",
  },
  {
    value: "securityGuard",
    label: "Security Guard",
  },
  {
    value: "coveredParking",
    label: "Covered Parking",
  },
  {
    value: "evCharging",
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
    value: "drinkingWater",
    label: "Drinking Water",
  },
  {
    value: "valetParking",
    label: "Valet Parking",
  },
  {
    value: "disabledAccess",
    label: "Disabled Access",
  },
  {
    value: "carWash",
    label: "Car Wash",
  },
] as const;

const DEFAULT_RULES = [
  "Valid parking booking is required.",
  "Follow parking staff instructions.",
  "Park only in the assigned slot.",
];

/* ============================================================
   VEHICLE TYPES
============================================================ */

type VehicleType = "twoWheeler" | "fourWheeler" | "vanMinibus" | "heavyVehicle";

const VEHICLE_TYPES: {
  value: VehicleType;
  label: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    value: "twoWheeler",
    label: "Two Wheeler",
    description: "Bike / Scooter",
    icon: Bike,
  },
  {
    value: "fourWheeler",
    label: "Four Wheeler",
    description: "Car / SUV",
    icon: Car,
  },
  {
    value: "vanMinibus",
    label: "Van / Minibus",
    description: "Van / Minibus",
    icon: Bus,
  },
  {
    value: "heavyVehicle",
    label: "Heavy Vehicle",
    description: "Truck / Bus",
    icon: Truck,
  },
];

/* ============================================================
   FORM STATE
============================================================ */

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

  vehicleTypes: VehicleType[];

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

/* ============================================================
   IMAGE TYPE
============================================================ */

interface ImageFile {
  file: File;
  preview: string;
}

/* ============================================================
   TOAST
============================================================ */

type ToastType = "error" | "success";

interface ToastState {
  type: ToastType;
  message: string;
}

/* ============================================================
   INITIAL FORM
============================================================ */

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
  rules: [...DEFAULT_RULES],

  entryInstructions: "",

  vehicleTypes: [],

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

/* ============================================================
   PAGE
============================================================ */

export default function OwnerAddParkingPage() {
  return (
    <ProtectedRoute allowedRoles={["parkingOwner"]}>
      <OwnerAddParking />
    </ProtectedRoute>
  );
}

function OwnerAddParking() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  const [newRule, setNewRule] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * Keep the latest image list available for unmount cleanup.
   *
   * This avoids revoking existing object URLs every time
   * imageFiles changes.
   */
  const imageFilesRef = useRef<ImageFile[]>([]);

  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      imageFilesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  /* ==========================================================
     TOAST
  ========================================================== */

  function showToast(type: ToastType, message: string) {
    setToast({
      type,
      message,
    });
  }

  function hideToast() {
    setToast(null);
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* ==========================================================
     VEHICLE TYPES
  ========================================================== */

  function toggleVehicleType(vehicleType: VehicleType) {
    setForm((previous) => {
      const exists = previous.vehicleTypes.includes(vehicleType);

      return {
        ...previous,
        vehicleTypes: exists
          ? previous.vehicleTypes.filter((item) => item !== vehicleType)
          : [...previous.vehicleTypes, vehicleType],
      };
    });
  }

  function isVehicleSelected(vehicleType: VehicleType) {
    return form.vehicleTypes.includes(vehicleType);
  }

  /* ==========================================================
     BOOKING MODES
  ========================================================== */

  function toggleBookingMode(
    mode: "hourlyBooking" | "dailyBooking" | "monthlyBooking",
  ) {
    setForm((previous) => {
      const nextValue = !previous[mode];

      const next: FormState = {
        ...previous,
        [mode]: nextValue,
      };

      /*
       * Clear pricing when its booking mode is disabled.
       */

      if (mode === "hourlyBooking" && !nextValue) {
        next.twoWheelerHourly = "";
        next.fourWheelerHourly = "";
        next.vanHourly = "";
        next.heavyHourly = "";
      }

      if (mode === "dailyBooking" && !nextValue) {
        next.twoWheelerDaily = "";
        next.fourWheelerDaily = "";
        next.vanDaily = "";
        next.heavyDaily = "";
      }

      if (mode === "monthlyBooking" && !nextValue) {
        next.twoWheelerMonthly = "";
        next.fourWheelerMonthly = "";
        next.vanMonthly = "";
        next.heavyMonthly = "";
      }

      return next;
    });
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

  /* ==========================================================
     RULES
  ========================================================== */

  function addRule() {
    const rule = newRule.trim();

    if (!rule) {
      return;
    }

    if (rule.length > 300) {
      showToast("error", "Parking rule cannot exceed 300 characters.");
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

  /* ==========================================================
     LIVE LOCATION
  ========================================================== */

  function getLiveLocation() {
    hideToast();

    if (!navigator.geolocation) {
      showToast("error", "Your browser does not support live location.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setForm((previous) => ({
          ...previous,
          latitude: latitude.toFixed(7),
          longitude: longitude.toFixed(7),
        }));

        setLoadingLocation(false);

        showToast("success", "Current location added successfully.");
      },

      (locationError) => {
        setLoadingLocation(false);

        switch (locationError.code) {
          case 1:
            showToast(
              "error",
              "Location permission was denied. Please allow location access.",
            );
            break;

          case 2:
            showToast("error", "Unable to determine your current location.");
            break;

          case 3:
            showToast("error", "Location request timed out. Please try again.");
            break;

          default:
            showToast("error", "Unable to get your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  /* ==========================================================
     IMAGE PICKER
  ========================================================== */

  function addImage() {
    if (imageFiles.length >= MAX_IMAGES) {
      showToast("error", `Maximum ${MAX_IMAGES} parking images are allowed.`);
      return;
    }

    fileInputRef.current?.click();
  }

  function removeImage(index: number) {
    setImageFiles((previous) => {
      const image = previous[index];

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return previous.filter((_, fileIndex) => fileIndex !== index);
    });

    hideToast();
  }

  function addFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_IMAGES - imageFiles.length;

    if (remainingSlots <= 0) {
      showToast("error", `Maximum ${MAX_IMAGES} parking images are allowed.`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    const invalidFile = filesToAdd.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      showToast("error", `"${invalidFile.name}" is not a valid image file.`);
      return;
    }

    const oversizedFile = filesToAdd.find((file) => file.size > MAX_IMAGE_SIZE);

    if (oversizedFile) {
      showToast(
        "error",
        `"${oversizedFile.name}" is too large. Each image must be smaller than 5 MB.`,
      );
      return;
    }

    const uniqueFiles = filesToAdd.filter((newFile) => {
      return !imageFiles.some(
        (existingImage) =>
          existingImage.file.name === newFile.name &&
          existingImage.file.size === newFile.size &&
          existingImage.file.lastModified === newFile.lastModified,
      );
    });

    if (uniqueFiles.length === 0) {
      showToast("error", "Those images have already been added.");
      return;
    }

    const newImages: ImageFile[] = uniqueFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImageFiles((previous) => [...previous, ...newImages]);

    if (files.length > remainingSlots) {
      showToast(
        "error",
        `Only ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else {
      hideToast();
    }
  }

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    addFiles(files);

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (imageFiles.length < MAX_IMAGES) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (imageFiles.length >= MAX_IMAGES) {
      showToast("error", `Maximum ${MAX_IMAGES} parking images are allowed.`);
      return;
    }

    const files = Array.from(event.dataTransfer.files);

    addFiles(files);
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function getValidationErrors(): string[] {
    const errors: string[] = [];

    /* ----------------------------------------------------------
       BASIC INFORMATION
    ---------------------------------------------------------- */

    if (form.parkingName.trim().length < 2) {
      errors.push("Parking name is required.");
    }

    if (form.parkingName.trim().length > 100) {
      errors.push("Parking name cannot exceed 100 characters.");
    }

    if (form.description.trim().length > 2000) {
      errors.push("Description cannot exceed 2000 characters.");
    }

    /* ----------------------------------------------------------
       LOCATION
    ---------------------------------------------------------- */

    if (form.address.trim().length < 5) {
      errors.push("Parking address is required.");
    }

    if (form.address.trim().length > 250) {
      errors.push("Parking address cannot exceed 250 characters.");
    }

    if (form.landmark.trim().length > 150) {
      errors.push("Landmark cannot exceed 150 characters.");
    }

    if (form.city.trim().length < 2) {
      errors.push("City is required.");
    }

    if (form.city.trim().length > 100) {
      errors.push("City cannot exceed 100 characters.");
    }

    if (form.state.trim().length < 2) {
      errors.push("State is required.");
    }

    if (form.state.trim().length > 100) {
      errors.push("State cannot exceed 100 characters.");
    }

    if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      errors.push("Enter a valid 6-digit pincode.");
    }

    /* ----------------------------------------------------------
       OWNER
    ---------------------------------------------------------- */

    if (form.ownerName.trim().length < 2) {
      errors.push("Owner name is required.");
    }

    if (form.ownerName.trim().length > 100) {
      errors.push("Owner name cannot exceed 100 characters.");
    }

    if (!/^[6-9]\d{9}$/.test(form.contactNumber.trim())) {
      errors.push("Enter a valid 10-digit mobile number.");
    }

    /* ----------------------------------------------------------
       PARKING AREA
    ---------------------------------------------------------- */

    const area = Number(form.parkingArea);

    if (!Number.isFinite(area) || area <= 0) {
      errors.push("Parking area must be greater than 0.");
    }

    /* ----------------------------------------------------------
       LOCATION COORDINATES
    ---------------------------------------------------------- */

    const latitude = Number(form.latitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      errors.push("Valid latitude is required.");
    }

    const longitude = Number(form.longitude);

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      errors.push("Valid longitude is required.");
    }

    /* ----------------------------------------------------------
       IMAGES
    ---------------------------------------------------------- */

    if (imageFiles.length < MIN_IMAGES) {
      errors.push(`At least ${MIN_IMAGES} parking images are required.`);
    }

    if (imageFiles.length > MAX_IMAGES) {
      errors.push(`Maximum ${MAX_IMAGES} parking images are allowed.`);
    }

    /* ----------------------------------------------------------
       VEHICLES
    ---------------------------------------------------------- */

    if (form.vehicleTypes.length === 0) {
      errors.push("Select at least one vehicle type.");
    }

    /* ----------------------------------------------------------
       OPERATING HOURS
    ---------------------------------------------------------- */

    if (!form.openingTime || !form.closingTime) {
      errors.push("Opening and closing time are required.");
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timeRegex.test(form.openingTime)) {
      errors.push("Invalid opening time.");
    }

    if (!timeRegex.test(form.closingTime)) {
      errors.push("Invalid closing time.");
    }

    /* ----------------------------------------------------------
       BOOKING MODES
    ---------------------------------------------------------- */

    if (!form.hourlyBooking && !form.dailyBooking && !form.monthlyBooking) {
      errors.push("Select at least one booking mode.");
    }

    /* ----------------------------------------------------------
       CURRENCY
    ---------------------------------------------------------- */

    if (!/^[A-Z]{3}$/.test(form.currency.trim().toUpperCase())) {
      errors.push("Currency must be a valid 3-letter code such as INR.");
    }

    /* ----------------------------------------------------------
       PRICING
    ---------------------------------------------------------- */

    const pricingValues: string[] = [];

    if (isVehicleSelected("twoWheeler")) {
      if (form.hourlyBooking) {
        pricingValues.push(form.twoWheelerHourly);
      }

      if (form.dailyBooking) {
        pricingValues.push(form.twoWheelerDaily);
      }

      if (form.monthlyBooking) {
        pricingValues.push(form.twoWheelerMonthly);
      }
    }

    if (isVehicleSelected("fourWheeler")) {
      if (form.hourlyBooking) {
        pricingValues.push(form.fourWheelerHourly);
      }

      if (form.dailyBooking) {
        pricingValues.push(form.fourWheelerDaily);
      }

      if (form.monthlyBooking) {
        pricingValues.push(form.fourWheelerMonthly);
      }
    }

    if (isVehicleSelected("vanMinibus")) {
      if (form.hourlyBooking) {
        pricingValues.push(form.vanHourly);
      }

      if (form.dailyBooking) {
        pricingValues.push(form.vanDaily);
      }

      if (form.monthlyBooking) {
        pricingValues.push(form.vanMonthly);
      }
    }

    if (isVehicleSelected("heavyVehicle")) {
      if (form.hourlyBooking) {
        pricingValues.push(form.heavyHourly);
      }

      if (form.dailyBooking) {
        pricingValues.push(form.heavyDaily);
      }

      if (form.monthlyBooking) {
        pricingValues.push(form.heavyMonthly);
      }
    }

    /*
     * Every enabled vehicle + booking mode must have a price.
     */
    const missingPricing = pricingValues.some((value) => !value.trim());

    if (missingPricing) {
      errors.push(
        "Enter pricing for every selected vehicle and enabled booking mode.",
      );
    }

    const invalidPricing = pricingValues.some((value) => {
      if (!value.trim()) {
        return false;
      }

      const number = Number(value);

      return !Number.isFinite(number) || number < 0;
    });

    if (invalidPricing) {
      errors.push("Parking prices must be valid non-negative numbers.");
    }

    return errors;
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    hideToast();

    const validationErrors = getValidationErrors();

    if (validationErrors.length > 0) {
      showToast("error", validationErrors[0]);
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateParkingPayload = {
        parkingName: form.parkingName.trim(),

        description: form.description.trim() || undefined,

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

        entryInstructions: form.entryInstructions.trim() || undefined,

        supportedVehicleTypes: form.vehicleTypes,

        bookingModes: {
          hourly: form.hourlyBooking,
          daily: form.dailyBooking,
          monthly: form.monthlyBooking,
        },

        pricing: {
          currency: form.currency.trim().toUpperCase(),

          /* --------------------------------------------------
             TWO WHEELER
          -------------------------------------------------- */

          twoWheeler: {
            hourly:
              isVehicleSelected("twoWheeler") && form.hourlyBooking
                ? optionalNumber(form.twoWheelerHourly)
                : undefined,

            daily:
              isVehicleSelected("twoWheeler") && form.dailyBooking
                ? optionalNumber(form.twoWheelerDaily)
                : undefined,

            monthly:
              isVehicleSelected("twoWheeler") && form.monthlyBooking
                ? optionalNumber(form.twoWheelerMonthly)
                : undefined,
          },

          /* --------------------------------------------------
             FOUR WHEELER
          -------------------------------------------------- */

          fourWheeler: {
            hourly:
              isVehicleSelected("fourWheeler") && form.hourlyBooking
                ? optionalNumber(form.fourWheelerHourly)
                : undefined,

            daily:
              isVehicleSelected("fourWheeler") && form.dailyBooking
                ? optionalNumber(form.fourWheelerDaily)
                : undefined,

            monthly:
              isVehicleSelected("fourWheeler") && form.monthlyBooking
                ? optionalNumber(form.fourWheelerMonthly)
                : undefined,
          },

          /* --------------------------------------------------
             VAN / MINIBUS
          -------------------------------------------------- */

          vanMinibus: {
            hourly:
              isVehicleSelected("vanMinibus") && form.hourlyBooking
                ? optionalNumber(form.vanHourly)
                : undefined,

            daily:
              isVehicleSelected("vanMinibus") && form.dailyBooking
                ? optionalNumber(form.vanDaily)
                : undefined,

            monthly:
              isVehicleSelected("vanMinibus") && form.monthlyBooking
                ? optionalNumber(form.vanMonthly)
                : undefined,
          },

          /* --------------------------------------------------
             HEAVY VEHICLE
          -------------------------------------------------- */

          heavyVehicle: {
            hourly:
              isVehicleSelected("heavyVehicle") && form.hourlyBooking
                ? optionalNumber(form.heavyHourly)
                : undefined,

            daily:
              isVehicleSelected("heavyVehicle") && form.dailyBooking
                ? optionalNumber(form.heavyDaily)
                : undefined,

            monthly:
              isVehicleSelected("heavyVehicle") && form.monthlyBooking
                ? optionalNumber(form.heavyMonthly)
                : undefined,
          },
        },

        operatingHours: {
          open: form.openingTime,
          close: form.closingTime,
        },
      };

      /*
       * Files are uploaded separately by createParking().
       */
      const filesForUpload = imageFiles.map((image) => image.file);

      await createParking(payload, filesForUpload);

      showToast("success", "Parking created successfully.");

      /*
       * Prevent object URL cleanup from trying to
       * work on files after navigation.
       */
      imageFilesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      imageFilesRef.current = [];

      window.setTimeout(() => {
        router.push("/owner/parkings");
        router.refresh();
      }, 800);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);

      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("jwt") ||
        normalizedMessage.includes("token") ||
        normalizedMessage.includes("authentication") ||
        normalizedMessage.includes("unauthorized")
      ) {
        showToast(
          "error",
          "Your login session has expired. Please log in again.",
        );
      } else {
        showToast("error", message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#06544E] text-white">
      <OwnerNavbar />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={hideToast} />
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">
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
                Accurate location, vehicle types, images and pricing are
                required.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

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

          {/* ==================================================
              OWNER
          ================================================== */}

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
                inputMode="tel"
                icon={<Phone className="h-4 w-4" />}
              />
            </div>
          </FormSection>

          {/* ==================================================
              LOCATION
          ================================================== */}

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
                inputMode="decimal"
              />

              <Input
                label="Longitude"
                required
                value={form.longitude}
                onChange={(value) => updateField("longitude", value)}
                placeholder="85.8245"
                inputMode="decimal"
              />
            </div>

            <button
              type="button"
              onClick={getLiveLocation}
              disabled={loadingLocation || submitting}
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
                  updateField("parkingArea", sanitizeDecimal(value))
                }
                placeholder="e.g. 2500"
                type="number"
                inputMode="decimal"
                suffix="sq ft"
                min="0"
              />
            </div>
          </FormSection>

          {/* ==================================================
              VEHICLE TYPES
          ================================================== */}

          <FormSection
            icon={<Car className="h-5 w-5" />}
            title="Available vehicle types"
            description="Select which types of vehicles can use this parking."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {VEHICLE_TYPES.map((vehicle) => {
                const Icon = vehicle.icon;

                const selected = form.vehicleTypes.includes(vehicle.value);

                return (
                  <button
                    key={vehicle.value}
                    type="button"
                    onClick={() => toggleVehicleType(vehicle.value)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "flex items-center justify-between rounded-2xl border border-white/20 bg-white px-4 py-4 text-left text-[#06544E] shadow-lg"
                        : "flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          selected
                            ? "flex h-10 w-10 items-center justify-center rounded-xl bg-[#06544E] text-white"
                            : "flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span>
                        <span className="block text-sm font-semibold">
                          {vehicle.label}
                        </span>

                        <span
                          className={
                            selected
                              ? "mt-0.5 block text-xs text-[#06544E]/60"
                              : "mt-0.5 block text-xs text-white/30"
                          }
                        >
                          {vehicle.description}
                        </span>
                      </span>
                    </span>

                    <span
                      className={
                        selected
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#06544E] text-white"
                          : "flex h-6 w-6 items-center justify-center rounded-full border border-white/20"
                      }
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-white/35">
              Only selected vehicle types can later be used when creating
              parking slots.
            </p>
          </FormSection>

          {/* ==================================================
              IMAGES
          ================================================== */}

          <FormSection
            icon={<ImagePlus className="h-5 w-5" />}
            title="Parking images"
            description="Add 2 to 5 clear images of the actual parking location."
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border p-4 transition ${
                isDragging
                  ? "border-white/50 bg-white/[0.12]"
                  : "border-white/10 bg-transparent"
              }`}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imageFiles.map((image, index) => (
                  <ImagePreview
                    key={`${image.file.name}-${image.file.size}-${image.file.lastModified}`}
                    image={image}
                    index={index}
                    onRemove={() => removeImage(index)}
                  />
                ))}

                {imageFiles.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={addImage}
                    className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition ${
                      isDragging
                        ? "border-white/50 bg-white/[0.12] text-white"
                        : "border-white/20 bg-white/[0.04] text-white/50 hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <ImagePlus className="h-8 w-8" />

                    <span className="mt-3 text-sm font-semibold">
                      {isDragging ? "Drop images here" : "Add image"}
                    </span>

                    <span className="mt-1 text-xs">
                      {imageFiles.length}/{MAX_IMAGES} images
                    </span>

                    <span className="mt-2 text-xs text-white/30">
                      Click to browse or drag & drop
                    </span>
                  </button>
                )}
              </div>
            </div>

            <p className="mt-3 text-xs text-white/40">
              Minimum {MIN_IMAGES} images and maximum {MAX_IMAGES} images. Each
              image must be smaller than 5 MB.
            </p>
          </FormSection>

          {/* ==================================================
              FACILITIES
          ================================================== */}

          <FormSection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Facilities"
            description="Select everything available at your parking location."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FACILITIES.map((facility) => {
                const selected = form.facilities.includes(facility.value);

                return (
                  <button
                    key={facility.value}
                    type="button"
                    onClick={() => toggleFacility(facility.value)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "flex items-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3 text-left text-sm font-semibold text-[#06544E]"
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

                    {facility.label}
                  </button>
                );
              })}
            </div>
          </FormSection>

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
                maxLength={300}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
              />

              <button
                type="button"
                onClick={addRule}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#06544E]"
                aria-label="Add parking rule"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {form.rules.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/30">
                  No parking rules added.
                </p>
              ) : (
                form.rules.map((rule) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="text-sm text-white/70">{rule}</span>

                    <button
                      type="button"
                      onClick={() => removeRule(rule)}
                      className="shrink-0 text-white/30 transition hover:text-red-300"
                      aria-label={`Remove rule: ${rule}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </FormSection>

          {/* ==================================================
              ENTRY
          ================================================== */}

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

          {/* ==================================================
              OPERATING HOURS
          ================================================== */}

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

          {/* ==================================================
              BOOKING MODES
          ================================================== */}

          <FormSection
            icon={<Clock3 className="h-5 w-5" />}
            title="Booking modes"
            description="Choose how customers can book your parking."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle
                label="Hourly"
                checked={form.hourlyBooking}
                onChange={() => toggleBookingMode("hourlyBooking")}
              />

              <Toggle
                label="Daily"
                checked={form.dailyBooking}
                onChange={() => toggleBookingMode("dailyBooking")}
              />

              <Toggle
                label="Monthly"
                checked={form.monthlyBooking}
                onChange={() => toggleBookingMode("monthlyBooking")}
              />
            </div>
          </FormSection>

          {/* ==================================================
              PRICING
          ================================================== */}

          <FormSection
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Parking pricing"
            description="Pricing is shown only for selected vehicle types and enabled booking modes."
          >
            <div className="mb-5 max-w-xs">
              <Input
                label="Currency"
                value={form.currency}
                onChange={(value) =>
                  updateField(
                    "currency",
                    value
                      .replace(/[^a-zA-Z]/g, "")
                      .slice(0, 3)
                      .toUpperCase(),
                  )
                }
                placeholder="INR"
              />
            </div>

            {form.vehicleTypes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                <Car className="mx-auto h-8 w-8 text-white/25" />

                <p className="mt-3 text-sm text-white/50">
                  Select at least one vehicle type above to configure pricing.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {isVehicleSelected("twoWheeler") && (
                  <PricingRow
                    title="Two Wheeler"
                    hourly={form.twoWheelerHourly}
                    daily={form.twoWheelerDaily}
                    monthly={form.twoWheelerMonthly}
                    showHourly={form.hourlyBooking}
                    showDaily={form.dailyBooking}
                    showMonthly={form.monthlyBooking}
                    onHourly={(value) => updateField("twoWheelerHourly", value)}
                    onDaily={(value) => updateField("twoWheelerDaily", value)}
                    onMonthly={(value) =>
                      updateField("twoWheelerMonthly", value)
                    }
                  />
                )}

                {isVehicleSelected("fourWheeler") && (
                  <PricingRow
                    title="Four Wheeler"
                    hourly={form.fourWheelerHourly}
                    daily={form.fourWheelerDaily}
                    monthly={form.fourWheelerMonthly}
                    showHourly={form.hourlyBooking}
                    showDaily={form.dailyBooking}
                    showMonthly={form.monthlyBooking}
                    onHourly={(value) =>
                      updateField("fourWheelerHourly", value)
                    }
                    onDaily={(value) => updateField("fourWheelerDaily", value)}
                    onMonthly={(value) =>
                      updateField("fourWheelerMonthly", value)
                    }
                  />
                )}

                {isVehicleSelected("vanMinibus") && (
                  <PricingRow
                    title="Van / Minibus"
                    hourly={form.vanHourly}
                    daily={form.vanDaily}
                    monthly={form.vanMonthly}
                    showHourly={form.hourlyBooking}
                    showDaily={form.dailyBooking}
                    showMonthly={form.monthlyBooking}
                    onHourly={(value) => updateField("vanHourly", value)}
                    onDaily={(value) => updateField("vanDaily", value)}
                    onMonthly={(value) => updateField("vanMonthly", value)}
                  />
                )}

                {isVehicleSelected("heavyVehicle") && (
                  <PricingRow
                    title="Heavy Vehicle"
                    hourly={form.heavyHourly}
                    daily={form.heavyDaily}
                    monthly={form.heavyMonthly}
                    showHourly={form.hourlyBooking}
                    showDaily={form.dailyBooking}
                    showMonthly={form.monthlyBooking}
                    onHourly={(value) => updateField("heavyHourly", value)}
                    onDaily={(value) => updateField("heavyDaily", value)}
                    onMonthly={(value) => updateField("heavyMonthly", value)}
                  />
                )}
              </div>
            )}
          </FormSection>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/owner/parkings")}
              disabled={submitting}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                  Uploading & creating...
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

/* ============================================================
   IMAGE PREVIEW
============================================================ */

function ImagePreview({
  image,
  index,
  onRemove,
}: {
  image: ImageFile;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="relative h-48 w-full">
        <Image
          src={image.preview}
          alt={`Parking image ${index + 1}`}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
        <p className="truncate text-xs text-white/80">{image.file.name}</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-red-500"
        aria-label={`Remove parking image ${index + 1}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ============================================================
   TOAST
============================================================ */

function Toast({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className="fixed right-5 top-24 z-[9999] w-[calc(100vw-2.5rem)] max-w-md animate-in slide-in-from-right-5 fade-in duration-200"
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
          isError
            ? "border-red-300/20 bg-[#124D49]/95"
            : "border-emerald-300/20 bg-[#124D49]/95"
        }`}
      >
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            isError ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {isError ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </div>

        <p className="flex-1 text-sm font-semibold leading-6 text-white">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   FORM SECTION
============================================================ */

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

/* ============================================================
   INPUT
============================================================ */

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
  min,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  icon?: ReactNode;
  suffix?: string;
  min?: string;
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
          min={min}
          disabled={false}
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

/* ============================================================
   TEXT AREA
============================================================ */

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

/* ============================================================
   SELECT
============================================================ */

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

/* ============================================================
   TOGGLE
============================================================ */

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
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

/* ============================================================
   PRICING ROW
============================================================ */

function PricingRow({
  title,
  hourly,
  daily,
  monthly,
  showHourly,
  showDaily,
  showMonthly,
  onHourly,
  onDaily,
  onMonthly,
}: {
  title: string;

  hourly: string;
  daily: string;
  monthly: string;

  showHourly: boolean;
  showDaily: boolean;
  showMonthly: boolean;

  onHourly: (value: string) => void;
  onDaily: (value: string) => void;
  onMonthly: (value: string) => void;
}) {
  const visibleFields = [showHourly, showDaily, showMonthly].filter(
    Boolean,
  ).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>

        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/40">
          {visibleFields} mode
          {visibleFields !== 1 ? "s" : ""}
        </span>
      </div>

      {visibleFields === 0 ? (
        <p className="text-sm text-white/30">
          Enable at least one booking mode.
        </p>
      ) : (
        <div
          className={`grid gap-4 ${
            visibleFields === 1
              ? "sm:grid-cols-1"
              : visibleFields === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
          }`}
        >
          {showHourly && (
            <Input
              label="Hourly"
              value={hourly}
              onChange={(value) => onHourly(sanitizeDecimal(value))}
              type="number"
              inputMode="decimal"
              placeholder="₹ 0"
              min="0"
            />
          )}

          {showDaily && (
            <Input
              label="Daily"
              value={daily}
              onChange={(value) => onDaily(sanitizeDecimal(value))}
              type="number"
              inputMode="decimal"
              placeholder="₹ 0"
              min="0"
            />
          )}

          {showMonthly && (
            <Input
              label="Monthly"
              value={monthly}
              onChange={(value) => onMonthly(sanitizeDecimal(value))}
              type="number"
              inputMode="decimal"
              placeholder="₹ 0"
              min="0"
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function sanitizeDecimal(value: string): string {
  const sanitized = value.replace(/[^0-9.]/g, "");

  const firstDotIndex = sanitized.indexOf(".");

  if (firstDotIndex === -1) {
    return sanitized;
  }

  return (
    sanitized.slice(0, firstDotIndex + 1) +
    sanitized.slice(firstDotIndex + 1).replace(/\./g, "")
  );
}
