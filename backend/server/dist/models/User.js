import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/roles.js";
const userSchema = new Schema(
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
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.method(
  "comparePassword",
  async function (candidatePassword) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(candidatePassword, this.password);
  },
);
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
