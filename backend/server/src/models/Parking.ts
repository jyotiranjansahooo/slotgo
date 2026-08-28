import mongoose, { Schema, Types } from "mongoose";
import { FACILITY_VALUES } from "../constants/facilities.js";
import {
  PARKING_STATUS,
  PARKING_STATUS_VALUES,
  PARKING_TYPE_VALUES,
  ParkingStatus,
} from "../constants/parking.js";
import { VEHICLE_TYPE_VALUES, VehicleType } from "../constants/vehicle.js";

export interface IParkingImage {
  url: string;
  publicId: string;
}

export interface IParking {
  ownerId: Types.ObjectId;

  parkingName: string;
  description: string;

  parkingType: string;

  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;

  location: {
    latitude: number;
    longitude: number;
  };

  ownerName: string;
  contactNumber: string;

  parkingArea: number;

  facilities: string[];

  rules: string[];

  entryInstructions: string;
  supportedVehicleTypes: VehicleType[];

  bookingModes: {
    hourly: boolean;
    daily: boolean;
    monthly: boolean;
  };

  pricing: {
    currency: string;

    twoWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    fourWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    vanMinibus: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    heavyVehicle: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };
  };

  images: IParkingImage[];

  operatingHours: {
    open: string;
    close: string;
  };

  averageRating: number;
  totalReviews: number;

  status: ParkingStatus;

  isActive: boolean;
}

export const PARKING_FACILITIES = [
  "cctv",
  "security_guard",
  "covered_parking",
  "ev_charging",
  "lighting",
  "washroom",
  "drinking_water",
  "valet_parking",
  "disabled_access",
  "car_wash",
] as const;
export type ParkingFacility = (typeof PARKING_FACILITIES)[number];
const imageSchema = new Schema<IParkingImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* ============================================================
   LOCATION SCHEMA
   ============================================================ */

const locationSchema = new Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  {
    _id: false,
  },
);

/* ============================================================
   BOOKING MODES
   ============================================================ */

const bookingModeSchema = new Schema(
  {
    hourly: {
      type: Boolean,
      default: true,
    },

    daily: {
      type: Boolean,
      default: true,
    },

    monthly: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

/* ============================================================
   VEHICLE PRICING
   ============================================================ */

const vehiclePricingSchema = new Schema(
  {
    hourly: {
      type: Number,
      min: 0,
    },

    daily: {
      type: Number,
      min: 0,
    },

    monthly: {
      type: Number,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/* ============================================================
   PRICING
   ============================================================ */

const pricingSchema = new Schema(
  {
    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}$/, "Currency must be a valid 3-letter code"],
    },

    twoWheeler: {
      type: vehiclePricingSchema,
      default: {},
    },

    fourWheeler: {
      type: vehiclePricingSchema,
      default: {},
    },

    vanMinibus: {
      type: vehiclePricingSchema,
      default: {},
    },

    heavyVehicle: {
      type: vehiclePricingSchema,
      default: {},
    },
  },
  {
    _id: false,
  },
);

/* ============================================================
   OPERATING HOURS
   ============================================================ */

const operatingHoursSchema = new Schema(
  {
    open: {
      type: String,
      required: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Invalid opening time. Use HH:mm format",
      ],
    },

    close: {
      type: String,
      required: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Invalid closing time. Use HH:mm format",
      ],
    },
  },
  {
    _id: false,
  },
);

const parkingSchema = new Schema<IParking>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    parkingName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    parkingType: {
      type: String,
      enum: PARKING_TYPE_VALUES,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid pincode"],
      index: true,
    },

    location: {
      type: locationSchema,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9][0-9]{9}$/, "Invalid contact number"],
    },

    parkingArea: {
      type: Number,
      required: true,
      min: 0,
    },

    facilities: {
      type: [
        {
          type: String,
          enum: PARKING_FACILITIES,
        },
      ],
      default: [],
    },

    rules: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 300,
        },
      ],
      default: [],
    },

    entryInstructions: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    supportedVehicleTypes: {
      type: [
        {
          type: String,
          enum: VEHICLE_TYPE_VALUES,
        },
      ],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one vehicle type is required.",
      },
    },
    bookingModes: {
      type: bookingModeSchema,
      required: true,
    },

    pricing: {
      type: pricingSchema,
      required: true,
    },

    /* ----------------------------------------------------------
       IMAGES
    ---------------------------------------------------------- */

    images: {
      type: [imageSchema],
      default: [],

      /*
       * Do NOT put required: true here.
       *
       * Your service/controller should enforce:
       * minimum 2 images
       * maximum 5 images
       *
       * This gives you a much cleaner error:
       * "At least 2 parking images are required."
       */
    },

    /* ----------------------------------------------------------
       OPERATING HOURS
    ---------------------------------------------------------- */

    operatingHours: {
      type: operatingHoursSchema,
      required: true,
    },

    /* ----------------------------------------------------------
       RATINGS
    ---------------------------------------------------------- */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ----------------------------------------------------------
       STATUS
    ---------------------------------------------------------- */

    status: {
      type: String,
      enum: PARKING_STATUS_VALUES,
      default: PARKING_STATUS.PENDING,
      index: true,
    },

    /* ----------------------------------------------------------
       ACTIVE
    ---------------------------------------------------------- */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

/* ============================================================
   INDEXES
   ============================================================ */

parkingSchema.index({
  ownerId: 1,
  isActive: 1,
});

parkingSchema.index({
  city: 1,
  isActive: 1,
  status: 1,
});

parkingSchema.index({
  pincode: 1,
  isActive: 1,
  status: 1,
});

parkingSchema.index({
  parkingType: 1,
  isActive: 1,
  status: 1,
});

parkingSchema.index({
  averageRating: -1,
  isActive: 1,
  status: 1,
});

const Parking =
  mongoose.models.Parking || mongoose.model<IParking>("Parking", parkingSchema);

export default Parking;
