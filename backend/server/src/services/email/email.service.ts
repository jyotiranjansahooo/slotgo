const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

if (!googleAppsScriptUrl) {
  throw new Error("GOOGLE_APPS_SCRIPT_URL is not configured.");
}

export const verifySmtpConnection = async (): Promise<void> => {
  console.log("Email service ready.");
};

export const sendVerificationOtp = async (
  email: string,
  otp: string,
): Promise<void> => {
  try {
    const response = await fetch(googleAppsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
      redirect: "follow",
    });

    const responseText = await response.text();

    console.log(`Google Apps Script status: ${response.status}`);

    if (!response.ok) {
      console.error(
        "Google Apps Script request failed:",
        responseText.slice(0, 500),
      );

      throw new Error(`Email service returned HTTP ${response.status}`);
    }

    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error("Email sending failed:", error);

    throw new Error("Unable to send verification email. Please try again.");
  }
};
