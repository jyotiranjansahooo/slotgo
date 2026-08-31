import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";

import bcrypt from "bcrypt";

import { USER_ROLES, USER_ROLE_VALUES, UserRole } from "../constants/roles.js";

export type AuthProvider = "local" | "google";

export type ParkingAction = "temporary-close" | "delete";

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

  actionVerificationOtpHash?: string;

  actionVerificationOtpExpiresAt?: Date;

  actionVerificationOtpAttempts: number;

  actionVerificationType?: ParkingAction;

  actionVerificationLastSentAt?: Date;

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

    /*
     * EMAIL
     */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,

      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    /*
     * PHONE
     */

    phoneNumber: {
      type: String,
      sparse: true,
      trim: true,

      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    /*
     * PASSWORD
     */

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    /*
     * AUTH PROVIDER
     */

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    /*
     * GOOGLE ID
     */

    googleId: {
      type: String,
      default: undefined,
    },

    /*
     * ROLE
     */

    role: {
      type: String,

      enum: USER_ROLE_VALUES,

      default: USER_ROLES.DRIVER,

      required: true,
    },

    /*
     * AVATAR
     */

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

    /*
     * REFRESH TOKEN
     */

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    /*
     * ACCOUNT VERIFICATION
     */

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

    actionVerificationOtpHash: {
      type: String,
      default: "",
      select: false,
    },

    actionVerificationOtpExpiresAt: {
      type: Date,
      default: undefined,
      select: false,
    },

    actionVerificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    actionVerificationType: {
      type: String,

      enum: ["temporary-close", "delete"],

      default: undefined,

      select: false,
    },

    actionVerificationLastSentAt: {
      type: Date,
      default: undefined,
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

    /*
     * LOGIN INFORMATION
     */

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

userSchema.index({
  role: 1,
});

userSchema.index(
  {
    googleId: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

/*
 * Phone numbers.
 */

userSchema.index(
  {
    phoneNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
*/

userSchema.pre("save", async function (): Promise<void> {
  /*
   * Only hash password when it has changed.
   */

  if (!this.isModified("password")) {
    return;
  }

  /*
   * Google users may not have a password.
   */

  if (!this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

/*
|--------------------------------------------------------------------------
| COMPARE PASSWORD
|--------------------------------------------------------------------------
*/

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
