import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES, USER_ROLE_VALUES, UserRole } from "../constants/roles.js";

export interface IUser extends Document {
  name: {
    first: string;
    last: string;
  };

  email: string;
  phoneNumber: string;
  password: string;

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

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      first: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: 3,
        maxlength: 30,
      },

      last: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: 3,
        maxlength: 30,
      },
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.DRIVER,
    },

    avatar: {
      url: {
        type: String,
        default: " ",
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
    },

    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

/* Indexes */
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });

/* Hash Password */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

/* Compare Password */
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/* Model */
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
