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

  twoWheeler: vehiclePricingSchema.optional(),

  fourWheeler: vehiclePricingSchema.optional(),

  vanMinibus: vehiclePricingSchema.optional(),

  heavyVehicle: vehiclePricingSchema.optional(),
});

export const updateParkingSchema = z.object({
  parkingName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  parkingType: z
    .enum(
      PARKING_TYPE_VALUES as [string, ...string[]],
    )
    .optional(),

  address: z
    .string()
    .trim()
    .min(5)
    .optional(),

  landmark: z
    .string()
    .trim()
    .optional(),

  city: z
    .string()
    .trim()
    .min(2)
    .optional(),

  state: z
    .string()
    .trim()
    .min(2)
    .optional(),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional(),

  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),

  facilities: z
    .array(
      z.enum(
        PARKING_FACILITY_VALUES as [
          string,
          ...string[],
        ],
      ),
    )
    .optional(),

  rules: z
    .array(z.string().trim().min(1))
    .optional(),

  entryInstructions: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  bookingModes: z
    .object({
      hourly: z.boolean().optional(),
      daily: z.boolean().optional(),
      monthly: z.boolean().optional(),
    })
    .optional(),

  pricing: pricingSchema.optional(),

  operatingHours: z
    .object({
      open: z.string().min(1),
      close: z.string().min(1),
    })
    .optional(),
});

export type UpdateParkingInput =
  z.infer<typeof updateParkingSchema>;