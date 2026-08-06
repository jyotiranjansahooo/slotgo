import ApiError from "../../utils/ApiError.js";
import userRepository from "../../repositories/user.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";
import { RegisterInput } from "../../validations/auth/register.validation.js";

export const registerService = async (
  data: RegisterInput
) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role,
  } = data;

  // Check Email
  if (await userRepository.emailExists(email)) {
    throw new ApiError(409, "Email already exists");
  }

  // Check Phone
  if (await userRepository.phoneExists(phoneNumber)) {
    throw new ApiError(409, "Phone number already exists");
  }

  // Create User
  const createdUser = await userRepository.create({
    name: {
      first: firstName,
      last: lastName,
    },
    email,
    phoneNumber,
    password,
    role,
  });

  // Generate Tokens
  const accessToken = generateAccessToken(createdUser);
  const refreshToken = generateRefreshToken(createdUser);

  // Save Refresh Token
  await userRepository.updateRefreshToken(
    createdUser.id,
    refreshToken
  );

  // Fetch Clean User
  const user = await userRepository.findById(createdUser.id);

  if (!user) {
    throw new ApiError(500, "Failed to fetch user");
  }

  return {
    user,
    accessToken,
    refreshToken,
  };
};