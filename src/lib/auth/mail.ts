import nodemailer from "nodemailer";

type SendOtpEmailParams = {
  email: string;
  otp: string;
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION";
};

function getOtpSubject(purpose: SendOtpEmailParams["purpose"]) {
  if (purpose === "PASSWORD_RESET") {
    return "Reset your EquityLens AI password";
  }

  if (purpose === "LOGIN_VERIFICATION") {
    return "Your EquityLens AI login code";
  }

  return "Verify your EquityLens AI account";
}

function getOtpMessage(purpose: SendOtpEmailParams["purpose"]) {
  if (purpose === "PASSWORD_RESET") {
    return "Use this code to reset your EquityLens AI password.";
  }

  if (purpose === "LOGIN_VERIFICATION") {
    return "Use this code to complete your EquityLens AI login.";
  }

  return "Use this code to verify your EquityLens AI account.";
}

export async function sendOtpEmail({
  email,
  otp,
  purpose,
}: SendOtpEmailParams) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  const subject = getOtpSubject(purpose);
  const message = getOtpMessage(purpose);

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    console.log("====================================");
    console.log("EquityLens AI OTP Email");
    console.log("Email:", email);
    console.log("Purpose:", purpose);
    console.log("OTP:", otp);
    console.log("Note: SMTP is not configured, so OTP is logged in terminal.");
    console.log("====================================");

    return {
      sent: false,
      mode: "console",
      message: "SMTP not configured. OTP logged in terminal.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject,
    html: createOtpEmailTemplate({
      otp,
      message,
      subject,
    }),
  });

  return {
    sent: true,
    mode: "smtp",
    message: "OTP email sent successfully.",
  };
}

function createOtpEmailTemplate({
  otp,
  subject,
  message,
}: {
  otp: string;
  subject: string;
  message: string;
}) {
  return `
    <div style="margin:0;padding:0;background:#020617;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:32px;color:white;">
          <div style="display:inline-block;background:rgba(34,211,238,0.12);color:#67e8f9;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            EquityLens AI
          </div>

          <h1 style="font-size:28px;line-height:1.2;margin:24px 0 12px;font-weight:900;">
            ${subject}
          </h1>

          <p style="font-size:15px;line-height:1.7;color:#cbd5e1;margin:0 0 24px;">
            ${message}
          </p>

          <div style="background:#020617;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:22px;text-align:center;margin:24px 0;">
            <p style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 10px;font-weight:800;">
              Verification Code
            </p>

            <div style="font-size:42px;font-weight:900;letter-spacing:0.22em;color:#67e8f9;">
              ${otp}
            </div>
          </div>

          <p style="font-size:13px;line-height:1.7;color:#94a3b8;margin:0;">
            This code expires in 10 minutes. If you did not request this code,
            you can safely ignore this email.
          </p>
        </div>

        <p style="text-align:center;color:#64748b;font-size:12px;margin-top:20px;">
          EquityLens AI · Autonomous Investment Research
        </p>
      </div>
    </div>
  `;
}