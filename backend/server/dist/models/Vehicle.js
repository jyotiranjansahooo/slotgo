import mongoose, { Schema } from "mongoose";
import { VEHICLE_TYPE_VALUES } from "../constants/vehicle.js";
const vehicleSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
        index: true,
    },
    vehicleType: {
        type: String,
        enum: VEHICLE_TYPE_VALUES,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true,
        match: [
            /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
            "Invalid registration number",
        ],
    },
    brand: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40,
    },
    vehicleModel: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40,
    },
    color: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
vehicleSchema.index({
    ownerId: 1,
    isDefault: 1,
});
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
//# sourceMappingURL=Vehicle.js.map