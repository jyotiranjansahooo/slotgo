import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";

import bcrypt from "bcrypt";

import { USER_ROLES, USER_ROLE_VALUES, UserRole } from "../constants/roles.js";

export type AuthProvider = "local" | "google";

export interface IUser {
  _id: Types.ObjectId;

  name: {
    first: string;
    last: string;
  };

  email: string;

  phoneNumber?: string;

  password?: string;

  authProvider: AuthProvider;

  googleId?: string;

  role: UserRole;

  avatar: {
    url: string;
    publicId: string;
  };

  refreshToken?: string;

  isVerified: boolean;

  verifiedAt?: Date;

  verificationOtpHash?: string;

  verificationOtpExpiresAt?: Date;

  verificationOtpAttempts: number;

  isActive: boolean;

  deletedAt?: Date | null;

  lastLogin?: Date;

  loginCount: number;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      first: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },

      last: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30,
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    phoneNumber: {
      type: String,
      sparse: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    googleId: {
      type: String,
      default: undefined,
    },

    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.DRIVER,
      required: true,
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: undefined,
    },

    verificationOtpHash: {
      type: String,
      default: "",
      select: false,
    },

    verificationOtpExpiresAt: {
      type: Date,
      default: undefined,
      select: false,
    },

    verificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: undefined,
    },

    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1 });

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.pre("save", async function (): Promise<void> {
  if (!this.isModified("password")) {
    return;
  }

  if (!this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.method(
  "comparePassword",
  async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(candidatePassword, this.password);
  },
);

const User =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
