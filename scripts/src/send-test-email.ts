import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("[send-test-email] RESEND_API_KEY nicht gesetzt — abbruch.");
  process.exit(1);
}

const TO = process.argv[2] ?? "Christoph.aldering@googlemail.com";

const POSTER_PATH = resolve(__dirname, "../../artifacts/api-server/assets/boomerpartyposter.jpeg");
const posterBuffer = readFileSync(POSTER_PATH);

const POSTER_CID = "boomerpartyposter";

const ABSENDER_MAIL = "boomerparty26@emmerich-boomt.de";
const ABSENDER_NAME = "Boomerparty Emmerich";
const KONTOINHABER  = "Christoph Aldering";
const IBAN          = "DE85120300001312386293";
const PAYPAL_LINK   = "https://www.paypal.com/pool/9pkJxWVmh2?sr=wccr";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Emmerich boomt! — Anmeldung</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="600"
    style="display:block;width:100%;max-height:300px;object-fit:cover;object-position:center top;" />

  <div style="padding:40px 32px 48px;">

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Schön, dass du dabei bist! (TEST-MAIL)
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Dies ist eine Test-Mail zur Überprüfung, ob das Poster-Bild korrekt inline eingebettet erscheint.
      Das Bild oben sollte das BoomerParty-Poster zeigen — <strong>ohne externe URL</strong>, direkt aus dem E-Mail-Anhang.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Deine Anmeldung für „Emmerich boomt!" ist angekommen – wir freuen uns drauf. Damit dein Platz fix ist, fehlt nur noch eins: der Beitrag von 10&nbsp;€ pro Person.
    </p>

    <div style="margin:0 0 20px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 14px;">Per Überweisung</p>
      <table style="border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;line-height:1.7;">
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;">Empfänger</td><td>${escHtml(KONTOINHABER)}</td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;">IBAN</td><td><span style="font-family:Courier,Menlo,monospace;letter-spacing:.04em;">${escHtml(IBAN)}</span></td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;">Betrag</td><td>10&nbsp;€ pro Person</td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;vertical-align:top;">Verwendungszweck</td><td>Emmerich boomt + dein Name</td></tr>
      </table>
    </div>

    <div style="margin:0 0 32px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 10px;">Oder per PayPal</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.9);margin:0 0 8px;line-height:1.6;">
        Ganz bequem in unseren Sammel-Pool:<br>
        <a href="${escHtml(PAYPAL_LINK)}" style="color:#e8991a;font-family:Courier,Menlo,monospace;font-size:13px;word-break:break-all;">${escHtml(PAYPAL_LINK)}</a>
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:rgba(245,232,200,.8);line-height:1.8;margin:0 0 24px;">
      Bis bald auf dem Bölt,<br>
      Christoph Aldering für das Orga-Team „Emmerich boomt!"
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:rgba(245,232,200,.5);line-height:1.7;margin:0;border-top:1px solid rgba(232,153,26,.2);padding-top:16px;">
      ⚠️ TEST-MAIL — kein echter Anmeldedatensatz. Poster-Bild oben sollte inline sichtbar sein.
    </p>

  </div>
</div>
</body>
</html>`;

const text = [
  "TEST-MAIL — Poster-Bild inline eingebettet?",
  "",
  "Schön, dass du dabei bist! (TEST)",
  "",
  "Diese Mail prüft, ob das BoomerParty-Poster als inline-Bild erscheint.",
  "",
  `Empfänger: ${KONTOINHABER}`,
  `IBAN: ${IBAN}`,
  `PayPal: ${PAYPAL_LINK}`,
  "",
  "Bis bald auf dem Bölt,",
  "Christoph Aldering f\u00fcr das Orga-Team \u201eEmmerich boomt!\u201c",
].join("\n");

console.log(`[send-test-email] Sende Test-Mail an: ${TO}`);
console.log(`[send-test-email] Poster-Bild: ${POSTER_PATH} (${posterBuffer.length} Bytes)`);

const resend = new Resend(RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
  to:      [TO],
  replyTo: ABSENDER_MAIL,
  subject: "[TEST] Schön, dass du dabei bist – Poster inline?",
  html,
  text,
  attachments: [
    {
      filename:    "boomerpartyposter.jpeg",
      content:     posterBuffer,
      contentType: "image/jpeg",
      contentId:   POSTER_CID,
    },
  ],
});

if (error) {
  console.error("[send-test-email] Resend-Fehler:", JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log("[send-test-email] ✓ Mail versendet. ID:", data?.id);
console.log("[send-test-email] Bitte in der Inbox prüfen, ob das Poster inline erscheint.");
