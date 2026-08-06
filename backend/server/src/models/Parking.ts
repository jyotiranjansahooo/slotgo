import mongoose, { Schema, Types } from "mongoose";

import {
  PARKING_STATUS,
  PARKING_STATUS_VALUES,
  PARKING_TYPE_VALUES,
  PARKING_FACILITY_VALUES,
  ParkingStatus,
} from "../constants/parking.js";

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

  facilities: string[];

  rules: string[];

  entryInstructions: string;

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

  images: {
    url: string;
    publicId: string;
  }[];

  operatingHours: {
    open: string;
    close: string;
  };

  averageRating: number;

  totalReviews: number;

  status: ParkingStatus;

  isActive: boolean;
}

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const locationSchema = new Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

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
  }
);

const vehiclePricingSchema = new Schema(
  {
    hourly: Number,

    daily: Number,

    monthly: Number,
  },
  {
    _id: false,
  }
);

const pricingSchema = new Schema(
  {
    currency: {
      type: String,
      default: "INR",
    },

    twoWheeler: vehiclePricingSchema,

    fourWheeler: vehiclePricingSchema,

    vanMinibus: vehiclePricingSchema,

    heavyVehicle: vehiclePricingSchema,
  },
  {
    _id: false,
  }
);

const operatingHoursSchema = new Schema(
  {
    open: {
      type: String,
      required: true,
    },

    close: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);