import { z } from "zod";

import { BOOKING_MODE_VALUES } from "../../constants/booking.js";

export const createBookingCheckoutSchema = z.object({
  parkingId: z.string().min(1, "Parking ID is required."),

  vehicleId: z.string().min(1, "Vehicle ID is required."),

  bookingMode: z.enum(
    BOOKING_MODE_VALUES as [string, ...string[]],
  ),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),
});

export type CreateBookingCheckoutInput = z.infer<
  typeof createBookingCheckoutSchema
>;