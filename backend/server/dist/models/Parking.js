import mongoose, { Schema } from "mongoose";
import { PARKING_STATUS, PARKING_STATUS_VALUES, PARKING_TYPE_VALUES, PARKING_FACILITY_VALUES, } from "../constants/parking.js";
const imageSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
}, {
    _id: false,
});
const locationSchema = new Schema({
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
}, {
    _id: false,
});
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
const vehiclePricingSchema = new Schema({
    hourly: Number,
    daily: Number,
    monthly: Number,
}, {
    _id: false,
});
const pricingSchema = new Schema({
    currency: {
        type: String,
        default: "INR",
    },
    twoWheeler: vehiclePricingSchema,
    fourWheeler: vehiclePricingSchema,
    vanMinibus: vehiclePricingSchema,
    heavyVehicle: vehiclePricingSchema,
}, {
    _id: false,
});
const operatingHoursSchema = new Schema({
    open: {
        type: String,
        required: true,
    },
    close: {
        type: String,
        required: true,
    },
}, {
    _id: false,
});
const parkingSchema = new Schema({
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
        maxlength: 1000,
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
    },
    landmark: {
        type: String,
        default: "",
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: locationSchema,
        required: true,
    },
    facilities: [
        {
            type: String,
            enum: PARKING_FACILITY_VALUES,
        },
    ],
    rules: [
        {
            type: String,
        },
    ],
    entryInstructions: {
        type: String,
        default: "",
        trim: true,
    },
    bookingModes: {
        type: bookingModeSchema,
        required: true,
    },
    pricing: {
        type: pricingSchema,
        required: true,
    },
    images: {
        type: [imageSchema],
        default: [],
    },
    operatingHours: {
        type: operatingHoursSchema,
        required: true,
    },
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
    status: {
        type: String,
        enum: PARKING_STATUS_VALUES,
        default: PARKING_STATUS.PENDING,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
const Parking = mongoose.models.Parking || mongoose.model("Parking", parkingSchema);
export default Parking;
//# sourceMappingURL=Parking.js.map