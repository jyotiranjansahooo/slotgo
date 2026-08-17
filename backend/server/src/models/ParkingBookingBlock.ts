import mongoose, { Document, Schema } from "mongoose";

export interface IParkingBookingBlock extends Document {
  parkingId: mongoose.Types.ObjectId;

  createdBy: mongoose.Types.ObjectId;

  startTime: Date;

  endTime: Date;

  reason?: string;

  createdAt: Date;

  updatedAt: Date;
}

const parkingBookingBlockSchema =
  new Schema<IParkingBookingBlock>(
    {
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
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

parkingBookingBlockSchema.index({
  parkingId: 1,
  startTime: 1,
  endTime: 1,
});

const ParkingBookingBlock =
  mongoose.models.ParkingBookingBlock ||
  mongoose.model<IParkingBookingBlock>(
    "ParkingBookingBlock",
    parkingBookingBlockSchema,
  );

export default ParkingBookingBlock;