import mongoose, {
  Schema,
  Types,
} from "mongoose";

export interface IPendingRegistration {
  _id: Types.ObjectId;

  firstName: string;

  lastName: string;

  email: string;

  phoneNumber: string;

  passwordHash: string;

  role: "driver" | "parkingOwner";

  otpHash: string;

  otpExpiresAt: Date;

  otpAttempts: number;

  lastOtpSentAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

const pendingRegistrationSchema =
  new Schema<IPendingRegistration>(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
        select: false,
      },

      role: {
        type: String,
        enum: ["driver", "parkingOwner"],
        required: true,
      },

      otpHash: {
        type: String,
        required: true,
        select: false,
      },

      otpExpiresAt: {
        type: Date,
        required: true,
        select: false,
      },

      otpAttempts: {
        type: Number,
        default: 0,
        select: false,
      },

      lastOtpSentAt: {
        type: Date,
        required: true,
        select: false,
      },
    },

    {
      timestamps: true,
      versionKey: false,
    },
  );

/*
 * Automatically remove expired registrations.
 */
pendingRegistrationSchema.index(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 0 },
);

pendingRegistrationSchema.index(
  { email: 1 },
  { unique: true },
);

const PendingRegistration =
  mongoose.models.PendingRegistration ||
  mongoose.model<IPendingRegistration>(
    "PendingRegistration",
    pendingRegistrationSchema,
  );

export default PendingRegistration;