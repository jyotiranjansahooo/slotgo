import { z } from "zod";
export declare const updateParkingSchema: z.ZodObject<{
    parkingName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parkingType: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    address: z.ZodOptional<z.ZodString>;
    landmark: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, z.core.$strip>>;
    facilities: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        [x: string]: string;
    }>>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString>>;
    entryInstructions: z.ZodOptional<z.ZodString>;
    bookingModes: z.ZodOptional<z.ZodObject<{
        hourly: z.ZodOptional<z.ZodBoolean>;
        daily: z.ZodOptional<z.ZodBoolean>;
        monthly: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    pricing: z.ZodOptional<z.ZodObject<{
        currency: z.ZodDefault<z.ZodString>;
        twoWheeler: z.ZodOptional<z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        fourWheeler: z.ZodOptional<z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        vanMinibus: z.ZodOptional<z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        heavyVehicle: z.ZodOptional<z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    operatingHours: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type UpdateParkingInput = z.infer<typeof updateParkingSchema>;
