import mongoose, { Schema, Types } from "mongoose";

export interface IReview {
  bookingId: Types.ObjectId;

  driverId: Types.ObjectId;

  ownerId: Types.ObjectId;

  parkingId: Types.ObjectId;

  rating: number;

  comment: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      immutable: true,
      unique: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    parkingId: {
      type: Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
      immutable: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({
  parkingId: 1,
  createdAt: -1,
});

const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default Review;
