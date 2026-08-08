import { z } from "zod";

import { BOOKING_MODE_VALUES } from "../../constants/booking.js";

export const createBookingSchema = z.object({
  parkingId: z.string().min(1),

  vehicleId: z.string().min(1),

  bookingMode: z.enum(BOOKING_MODE_VALUES as [string, ...string[]]),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
