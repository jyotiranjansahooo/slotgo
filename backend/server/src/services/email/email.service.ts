import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM;

if (
  !smtpHost ||
  !smtpUser ||
  !smtpPassword ||
  !smtpFrom
) {
  throw new Error(
    "Missing required SMTP environment variables.",
  );
}

const transportOptions: SMTPTransport.Options = {
  host: smtpHost,

  port: smtpPort,

  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },

  connectionTimeout: 10_000,

  greetingTimeout: 10_000,

  socketTimeout: 15_000,
};

const transporter =
  nodemailer.createTransport(transportOptions);

export const verifySmtpConnection =
  async (): Promise<void> => {
    try {
      await transporter.verify();

      console.log(
        "SMTP connection verified successfully",
      );
    } catch (error) {
      console.error(
        "SMTP connection failed:",
        error,
      );

      throw error;
    }
  };

export const sendVerificationOtp =
  async (
    email: string,
    otp: string,
  ): Promise<void> => {
    try {
      await transporter.sendMail({
        from: `"SlotGo" <${smtpFrom}>`,

        to: email,

        subject:
          "Verify your SlotGo account",

        text:
          `Your SlotGo verification code is ${otp}. ` +
          "It expires in 10 minutes.",

        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
            <h2>Verify your SlotGo account</h2>

            <p>
              Use the verification code below to complete
              your registration.
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
              This code expires in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request this code,
              you can safely ignore this email.
            </p>
          </div>
        `,
      });

      console.log(
        `Verification email sent successfully to ${email}`,
      );
    } catch (error) {
      console.error(
        "Nodemailer sendMail failed:",
        error,
      );

      throw error;
    }
  };

