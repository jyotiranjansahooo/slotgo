import ApiError from "../../utils/ApiError.js";

import userRepository from "../../repositories/user.repository.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

export const googleLoginService = async (credential) => {
  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new ApiError(401, "Invalid Google credential");
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    given_name: firstName,
    family_name: lastName,
    picture,
  } = payload;

  if (!googleId || !email) {
    throw new ApiError(401, "Google account information is incomplete");
  }

  if (!emailVerified) {
    throw new ApiError(401, "Google email is not verified");
  }

  /*
   * Find existing Google account.
   */

  let user = await userRepository.findByGoogleId(googleId);

  /*
   * If Google account doesn't exist,
   * try matching the email.
   */

  if (!user) {
    user = await userRepository.findByEmail(email);
  }

  /*
   * Existing account.
   */

  if (user) {
    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    /*
     * Link Google account to an existing
     * SlotGo account with the same email.
     */

    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";

      if (picture && !user.avatar?.url) {
        user.avatar = {
          url: picture,
          publicId: "",
        };
      }

      await user.save();
    }
  } else {
    /*
     * New Google account.
     *
     * Google doesn't provide a phone number,
     * so we cannot create a SlotGo user until
     * we have a phone number.
     */

    throw new ApiError(
      400,
      "No SlotGo account exists for this Google email. Please register first.",
    );
  }

  /*
   * Generate the same tokens used by normal login.
   */

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  await userRepository.updateRefreshToken(user.id, refreshToken);

  await userRepository.updateLastLogin(user.id);

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