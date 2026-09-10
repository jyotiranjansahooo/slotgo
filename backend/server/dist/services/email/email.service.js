const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
if (!googleAppsScriptUrl) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL is not configured.");
}
export const verifySmtpConnection = async () => {
    console.log("Email service ready.");
};
export const sendVerificationOtp = async (email, otp) => {
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
        });
        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        }
        catch {
            throw new Error("Invalid response from Google Apps Script.");
        }
        if (!response.ok || !result.success) {
            console.error("Google Apps Script email failed:", result);
            throw new Error(result.message ?? "Unable to send verification email.");
        }
        console.log(`Verification email sent successfully to ${email}`);
    }
    catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Unable to send verification email. Please try again.");
    }
};
//# sourceMappingURL=email.service.js.map