import { z } from "zod";
const vehiclePricingSchema = z.object({
    hourly: z.number().min(0).optional(),
    daily: z.number().min(0).optional(),
    monthly: z.number().min(0).optional(),
});
export const createParkingSchema = z.object({
    parkingName: z.string().trim().min(2, "Parking name is required.").max(100),
    description: z.string().trim().max(1000).default(""),
    parkingType: z.enum([
        "open",
        "covered",
        "basement",
        "multiLevel",
        "street",
    ]),
    address: z.string().trim().min(5, "Parking address is required.").max(250),
    landmark: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode."),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
    ownerName: z.string().trim().min(2, "Owner name is required.").max(100),
    contactNumber: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid contact number."),
    parkingArea: z
        .number()
        .positive("Parking area must be greater than 0."),
    facilities: z.array(z.string()).default([]),
    rules: z.array(z.string().trim().min(1).max(300)).default([]),
    entryInstructions: z.string().trim().max(1000).default(""),
    bookingModes: z
        .object({
        hourly: z.boolean(),
        daily: z.boolean(),
        monthly: z.boolean(),
    })
        .refine((value) => value.hourly || value.daily || value.monthly, {
        message: "At least one booking mode must be selected.",
    }),
    pricing: z.object({
        currency: z.string().trim().min(1).max(10).default("INR"),
        twoWheeler: vehiclePricingSchema,
        fourWheeler: vehiclePricingSchema,
        vanMinibus: vehiclePricingSchema,
        heavyVehicle: vehiclePricingSchema,
    }),
    operatingHours: z.object({
        open: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid opening time."),
        close: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid closing time."),
    }),
});
//# sourceMappingURL=create.validation.js.map