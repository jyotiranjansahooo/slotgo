import mongoose, { Schema } from "mongoose";
const parkingBookingBlockSchema = new Schema({
    parkingId: {
        type: Schema.Types.ObjectId,
        ref: "Parking",
        required: true,
        index: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        trim: true,
        maxlength: 200,
    },
}, {
    timestamps: true,
    versionKey: false,
});
parkingBookingBlockSchema.index({
    parkingId: 1,
    startTime: 1,
    endTime: 1,
});
const ParkingBookingBlock = mongoose.models.ParkingBookingBlock ||
    mongoose.model("ParkingBookingBlock", parkingBookingBlockSchema);
export default ParkingBookingBlock;
//# sourceMappingURL=ParkingBookingBlock.js.map