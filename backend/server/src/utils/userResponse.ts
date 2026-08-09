import { IUser } from "../models/User.js";

export const sanitizeUser = (user: IUser) => {
  return {
    id: user._id.toString(),
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
};