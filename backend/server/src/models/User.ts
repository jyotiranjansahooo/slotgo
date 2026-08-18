import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";
import bcrypt from "bcrypt";

import { USER_ROLES, USER_ROLE_VALUES, UserRole } from "../constants/roles.js";

export interface IUser {
  _id: Types.ObjectId;
  name: {
    first: string;
    last: string;
  };

  email: string;

  phoneNumber: string;

  password?: string;
  authProvider: "local" | "google";
  googleId?: string;
  role: UserRole;

  avatar: {
    url: string;
    publicId: string;
  };

  refreshToken?: string;

  isVerified: boolean;

  verifiedAt?: Date;

  isActive: boolean;

  deletedAt?: Date;

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
        minlength: 3,
        maxlength: 30,
      },

      last: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
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
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.DRIVER,
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

    verifiedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLogin: Date,

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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const password = this.password;

  if (!password) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  this.password = hashedPassword;
});

userSchema.method(
  "comparePassword",
  async function (candidatePassword: string): Promise<boolean> {
    const password = this.password;

    if (!password) {
      return false;
    }

    return bcrypt.compare(candidatePassword, password);
  },
);

const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
