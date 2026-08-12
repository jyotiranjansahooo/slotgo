import { z } from "zod";
export declare const createParkingSchema: z.ZodObject<{
    parkingName: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    parkingType: z.ZodEnum<{
        [x: string]: string;
    }>;
    address: z.ZodString;
    landmark: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodString;
    location: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, z.core.$strip>;
    facilities: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        [x: string]: string;
    }>>>;
    rules: z.ZodDefault<z.ZodArray<z.ZodString>>;
    entryInstructions: z.ZodDefault<z.ZodString>;
    bookingModes: z.ZodObject<{
        hourly: z.ZodDefault<z.ZodBoolean>;
        daily: z.ZodDefault<z.ZodBoolean>;
        monthly: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    pricing: z.ZodObject<{
        currency: z.ZodDefault<z.ZodString>;
        twoWheeler: z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        fourWheeler: z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        vanMinibus: z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        heavyVehicle: z.ZodObject<{
            hourly: z.ZodOptional<z.ZodNumber>;
            daily: z.ZodOptional<z.ZodNumber>;
            monthly: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodString;
    }, z.core.$strip>>>;
    operatingHours: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateParkingInput = z.infer<typeof createParkingSchema>;
