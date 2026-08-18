import ApiError from "../../utils/ApiError.js";
import userRepository from "../../repositories/user.repository.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
export const loginService = async (data) => {
  const { email, password } = data;
  // Find user with password
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  // Check account status
  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }
  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  // Save refresh token
  await userRepository.updateRefreshToken(user.id, refreshToken);
  // Update last login
  await userRepository.updateLastLogin(user.id);
  // Fetch clean user
  const cleanUser = await userRepository.findById(user.id);
  if (!cleanUser) {
    throw new ApiError(500, "Failed to fetch user");
  }
  return {
    user: cleanUser,
    accessToken,
    refreshToken,
  };
};
