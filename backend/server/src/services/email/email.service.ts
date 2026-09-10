import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured.");
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is not configured.");
}

const resend = new Resend(apiKey);

export const verifySmtpConnection = async (): Promise<void> => {
  console.log("Email service ready.");
};

export const sendVerificationOtp = async (
  email: string,
  otp: string,
): Promise<void> => {
  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject: "Verify your SlotGo account",
      text:
        `Your SlotGo verification code is ${otp}. ` +
        "It expires in 10 minutes.",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Verify your SlotGo account</h2>

          <p>
            Use the verification code below to complete your registration.
          </p>

          <div
            style="
              font-size:32px;
              font-weight:700;
              letter-spacing:8px;
              margin:24px 0;
            "
          >
            ${otp}
          </div>

          <p>
            This code expires in <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request this code,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("Resend email failed:", result.error);

      throw new Error(result.error.message);
    }

    console.log(
      `Verification email sent successfully to ${email}`,
    );
  } catch (error) {
    console.error("Email sending failed:", error);

    throw new Error(
      "Unable to send verification email. Please try again.",
    );
  }
};