import { z } from "zod";

import {
  PARKING_TYPE_VALUES,
  PARKING_FACILITY_VALUES,
} from "../../constants/parking.js";

const vehiclePricingSchema = z.object({
  hourly: z.number().min(0).optional(),
  daily: z.number().min(0).optional(),
  monthly: z.number().min(0).optional(),
});

const pricingSchema = z.object({
  currency: z.string().default("INR"),

  twoWheeler: vehiclePricingSchema,

  fourWheeler: vehiclePricingSchema,

  vanMinibus: vehiclePricingSchema,

  heavyVehicle: vehiclePricingSchema,
});

export const createParkingSchema = z.object({
  parkingName: z
    .string()
    .trim()
    .min(2, "Parking name must be at least 2 characters")
    .max(100, "Parking name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .default(""),

  parkingType: z.enum(
    PARKING_TYPE_VALUES as [string, ...string[]],
  ),

  address: z
    .string()
    .trim()
    .min(5, "Address is required"),

  landmark: z
    .string()
    .trim()
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City is required"),

  state: z
    .string()
    .trim()
    .min(2, "State is required"),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid pincode"),

  location: z.object({
    latitude: z
      .number()
      .min(-90)
      .max(90),

    longitude: z
      .number()
      .min(-180)
      .max(180),
  }),

  facilities: z
    .array(
      z.enum(
        PARKING_FACILITY_VALUES as [string, ...string[]],
      ),
    )
    .default([]),

  rules: z
    .array(
      z.string().trim().min(1),
    )
    .default([]),

  entryInstructions: z
    .string()
    .trim()
    .max(1000)
    .default(""),

  bookingModes: z.object({
    hourly: z.boolean().default(true),
    daily: z.boolean().default(true),
    monthly: z.boolean().default(false),
  }),

  pricing: pricingSchema,

  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
      }),
    )
    .default([]),

  operatingHours: z.object({
    open: z.string().min(1),
    close: z.string().min(1),
  }),
});

export type CreateParkingInput =
  z.infer<typeof createParkingSchema>;