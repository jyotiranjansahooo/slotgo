import mongoose, { Schema } from "mongoose";
import { PARKING_STATUS, PARKING_STATUS_VALUES, PARKING_TYPE_VALUES, PARKING_FACILITY_VALUES, } from "../constants/parking.js";
// IMAGE SCHEMA
const imageSchema = new Schema({
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
}, {
    _id: false,
});
// LOCATION SCHEMA
const locationSchema = new Schema({
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
}, {
    _id: false,
});
// BOOKING MODE SCHEMA
const bookingModeSchema = new Schema({
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
}, {
    _id: false,
});
// VEHICLE PRICING SCHEMA
const vehiclePricingSchema = new Schema({
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
}, {
    _id: false,
});
// PRICING SCHEMA
const pricingSchema = new Schema({
    currency: {
        type: String,
        default: "INR",
        trim: true,
        uppercase: true,
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
}, {
    _id: false,
});
// OPERATING HOURS SCHEMA
const operatingHoursSchema = new Schema({
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
}, {
    _id: false,
});
// PARKING SCHEMA
const parkingSchema = new Schema({
    // ========================================================
    // OWNER
    // ========================================================
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
        index: true,
    },
    // ========================================================
    // BASIC INFORMATION
    // ========================================================
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
        maxlength: 1000,
    },
    parkingType: {
        type: String,
        enum: PARKING_TYPE_VALUES,
        required: true,
    },
    // ========================================================
    // ADDRESS
    // ========================================================
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
    // ========================================================
    // GPS LOCATION
    // ========================================================
    location: {
        type: locationSchema,
        required: true,
    },
    // ========================================================
    // FACILITIES
    // ========================================================
    facilities: [
        {
            type: String,
            enum: PARKING_FACILITY_VALUES,
        },
    ],
    // ========================================================
    // RULES
    // ========================================================
    rules: [
        {
            type: String,
            trim: true,
            maxlength: 300,
        },
    ],
    // ========================================================
    // ENTRY INSTRUCTIONS
    // ========================================================
    entryInstructions: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
    },
    // ========================================================
    // BOOKING MODES
    // ========================================================
    bookingModes: {
        type: bookingModeSchema,
        required: true,
    },
    // ========================================================
    // PRICING
    // ========================================================
    pricing: {
        type: pricingSchema,
        required: true,
    },
    // ========================================================
    // IMAGES
    // ========================================================
    images: {
        type: [imageSchema],
        default: [],
    },
    // ========================================================
    // OPERATING HOURS
    // ========================================================
    operatingHours: {
        type: operatingHoursSchema,
        required: true,
    },
    // ========================================================
    // REVIEWS
    // ========================================================
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
    // ========================================================
    // STATUS
    // ========================================================
    status: {
        type: String,
        enum: PARKING_STATUS_VALUES,
        default: PARKING_STATUS.PENDING,
        index: true,
    },
    // ========================================================
    // ACTIVE STATUS
    // ========================================================
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// INDEXES
// Owner's parking locations
parkingSchema.index({
    ownerId: 1,
    isActive: 1,
});
// Driver search by city
parkingSchema.index({
    city: 1,
    isActive: 1,
    status: 1,
});
// Driver search by pincode
parkingSchema.index({
    pincode: 1,
    isActive: 1,
    status: 1,
});
// Parking type search
parkingSchema.index({
    parkingType: 1,
    isActive: 1,
    status: 1,
});
// Rating sorting/filtering
parkingSchema.index({
    averageRating: -1,
    isActive: 1,
    status: 1,
});
// MODEL
const Parking = mongoose.models.Parking || mongoose.model("Parking", parkingSchema);
export default Parking;
//# sourceMappingURL=Parking.js.map