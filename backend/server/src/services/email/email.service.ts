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

    console.log("Google Apps Script status:", response.status);
    console.log("Google Apps Script response:", responseText);

    if (!response.ok) {
      throw new Error(
        `Google Apps Script returned HTTP ${response.status}`,
      );
    }

    let result: {
      success?: boolean;
      message?: string;
    };

    try {
      result = JSON.parse(responseText) as {
        success?: boolean;
        message?: string;
      };
    } catch {
      throw new Error(
        `Google Apps Script returned a non-JSON response: ${responseText.slice(0, 300)}`,
      );
    }

    if (!result.success) {
      throw new Error(
        result.message ?? "Google Apps Script failed to send the email.",
      );
    }

    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error("Email sending failed:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to send verification email. Please try again.",
    );
  }
};