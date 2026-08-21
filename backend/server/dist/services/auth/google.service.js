import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";
import { generateAccessToken, generateRefreshToken, } from "../../utils/jwt.js";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLoginService = async ({ credential, role = "driver", }) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not configured.");
    }
    if (!credential) {
        throw new Error("Google credential is required.");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Invalid Google credential.");
    }
    const { sub: googleId, email, given_name, family_name, picture, email_verified, } = payload;
    if (!googleId || !email) {
        throw new Error("Google account information is incomplete.");
    }
    if (!email_verified) {
        throw new Error("Google email is not verified.");
    }
    let user = await User.findOne({
        $or: [{ googleId }, { email: email.toLowerCase() }],
    }).select("+refreshToken");
    /*
     * EXISTING USER
     */
    if (user) {
        // Link Google to an existing local account.
        if (!user.googleId) {
            user.googleId = googleId;
        }
        user.authProvider = "google";
        user.isVerified = true;
        user.verifiedAt = user.verifiedAt ?? new Date();
        if (picture && !user.avatar.url) {
            user.avatar.url = picture;
        }
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();
    }
    else {
        /*
         * NEW GOOGLE USER
         */
        user = await User.create({
            name: {
                first: given_name || "Google",
                last: family_name || "User",
            },
            email: email.toLowerCase(),
            authProvider: "google",
            googleId,
            role,
            avatar: {
                url: picture || "",
                publicId: "",
            },
            isVerified: true,
            verifiedAt: new Date(),
            isActive: true,
            lastLogin: new Date(),
            loginCount: 1,
        });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return {
        user,
        accessToken,
        refreshToken,
    };
};
//# sourceMappingURL=google.service.js.map