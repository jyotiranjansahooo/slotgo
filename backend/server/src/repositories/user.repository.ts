import User, { IUser } from "../models/User.js";

export interface CreateUserData {
  name: {
    first: string;
    last: string;
  };
  email: string;
  phoneNumber: string;
  password: string;
  role: IUser["role"];
}

class UserRepository {
  async create(userData: CreateUserData) {
    return User.create(userData);
  }

  async findById(id: string) {
    return User.findById(id);
  }

  async findByEmail(email: string) {
    return User.findOne({
      email: email.toLowerCase(),
    }).select("+password +refreshToken");
  }

  async findByPhone(phoneNumber: string) {
    return User.findOne({
      phoneNumber,
    });
  }

  async emailExists(email: string): Promise<boolean> {
    return !!(await User.exists({
      email: email.toLowerCase(),
    }));
  }

  async phoneExists(phoneNumber: string): Promise<boolean> {
    return !!(await User.exists({
      phoneNumber,
    }));
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return User.findByIdAndUpdate(userId, {
      refreshToken,
    });
  }

  async updateLastLogin(userId: string) {
    return User.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
      $inc: {
        loginCount: 1,
      },
    });
  }
  async findAll() {
    return User.find().select("-password -refreshToken").sort({
      createdAt: -1,
    });
  }

  async findByIdForAdmin(id: string) {
    return User.findById(id).select("-password -refreshToken");
  }

  async updateStatus(id: string, isActive: boolean) {
    return User.findByIdAndUpdate(
      id,
      {
        isActive,
        ...(isActive ? { deletedAt: null } : { deletedAt: new Date() }),
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -refreshToken");
  }
}

export default new UserRepository();
