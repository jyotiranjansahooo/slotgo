import mongoose, { Schema } from "mongoose";
import { VEHICLE_TYPE_VALUES } from "../constants/vehicle.js";
import { SLOT_STATUS, SLOT_STATUS_VALUES, } from "../constants/slot.js";
const parkingSlotSchema = new Schema({
    parkingId: {
        type: Schema.Types.ObjectId,
        ref: "Parking",
        required: true,
        immutable: true,
        index: true,
    },
    slotNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    floor: {
        type: String,
        default: "Ground",
        trim: true,
    },
    supportedVehicleTypes: [
        {
            type: String,
            enum: VEHICLE_TYPE_VALUES,
            required: true,
        },
    ],
    status: {
        type: String,
        enum: SLOT_STATUS_VALUES,
        default: SLOT_STATUS.AVAILABLE,
    },
    reservedUntil: {
        type: Date,
        default: null,
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastOccupiedAt: {
        type: Date,
    },
    notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
    },
}, {
    timestamps: true,
    versionKey: false,
});
/* One slot number cannot repeat inside the same parking */
parkingSlotSchema.index({
    parkingId: 1,
    slotNumber: 1,
}, {
    unique: true,
});
/* Fast lookup for available slots */
parkingSlotSchema.index({
    parkingId: 1,
    status: 1,
});
/* Fast lookup by vehicle type */
parkingSlotSchema.index({
    supportedVehicleTypes: 1,
});
const ParkingSlot = mongoose.models.ParkingSlot ||
    mongoose.model("ParkingSlot", parkingSlotSchema);
export default ParkingSlot;
//# sourceMappingURL=ParkingSlot.js.map