import nodemailer from "nodemailer";

const RECIPIENT = "Christoph.aldering@googlemail.com";
const SENDER    = process.env.GMAIL_USER ?? "Christoph.aldering@googlemail.com";

function createTransport() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: SENDER, pass },
  });
}

export async function sendDailyReport(html: string, text: string): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.warn("[Mailer] GMAIL_APP_PASSWORD nicht gesetzt — E-Mail übersprungen");
    return;
  }
  await transport.sendMail({
    from: `"Emmerich boomt 🎉" <${SENDER}>`,
    to: RECIPIENT,
    subject: `Tagesbericht Emmerich boomt — ${new Date().toLocaleDateString("de-DE")}`,
    text,
    html,
  });
  console.info("[Mailer] Tagesbericht versendet an", RECIPIENT);
}
