import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { SERVER_CONFIG } from "../config.js";

// ─── Gmail (täglicher Bericht) ───────────────────────────────────────────────

const GMAIL_SENDER    = process.env.GMAIL_USER ?? "Christoph.aldering@googlemail.com";
const GMAIL_RECIPIENT = "Christoph.aldering@googlemail.com";

function createGmailTransport() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_SENDER, pass },
  });
}

export async function sendDailyReport(html: string, text: string): Promise<void> {
  const transport = createGmailTransport();
  if (!transport) {
    console.warn("[Mailer] GMAIL_APP_PASSWORD nicht gesetzt — E-Mail übersprungen");
    return;
  }
  await transport.sendMail({
    from: `"Emmerich boomt" <${GMAIL_SENDER}>`,
    to: GMAIL_RECIPIENT,
    subject: `Tagesbericht Emmerich boomt — ${new Date().toLocaleDateString("de-DE")}`,
    text,
    html,
  });
  console.info("[Mailer] Tagesbericht versendet an", GMAIL_RECIPIENT);
}

// ─── Resend (Bestätigungsmail nach Anmeldung) ─────────────────────────────────

const {
  ABSENDER_MAIL,
  ABSENDER_NAME,
  IBAN,
  KONTOINHABER,
  BANK,
  PAYPAL_LINK,
  ANMELDEFRIST,
} = SERVER_CONFIG;

export interface BestaetigungsMailOptions {
  to:             string;
  personen:       string[];
  personen_anzahl: number;
  bezahlweg:      "ueberweisung" | "paypal";
  betrag_gesamt:  number;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const POSTER_CID = "boomerpartyposter";

function loadPosterBuffer(): Buffer {
  const assetPath = fileURLToPath(new URL("../assets/boomerpartyposter.jpeg", import.meta.url));
  return readFileSync(assetPath);
}

let _posterBuffer: Buffer | null = null;
function getPosterBuffer(): Buffer {
  if (!_posterBuffer) _posterBuffer = loadPosterBuffer();
  return _posterBuffer;
}

export async function sendBestaetigung(opts: BestaetigungsMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Emmerich boomt! — Anmeldung</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="600"
    style="display:block;width:100%;height:auto;" />

  <div style="padding:40px 32px 48px;">

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Schön, dass du dabei bist!
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Deine Anmeldung für \u201eEmmerich boomt!\u201c ist angekommen \u2013 wir freuen uns drauf. Damit dein Platz fix ist, fehlt nur noch eins: der Beitrag von 10&nbsp;\u20ac pro Person.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Und jetzt kommt der Teil, bei dem wir uns selbst ein bisschen an die eigene Nase fassen: Wir wissen alle, wie das l\u00e4uft. Man nimmt sich vor, das \u201esp\u00e4ter\u201c zu machen \u2013 und dann kommt das Leben dazwischen, das Telefon klingelt, der Garten ruft, und schwupp ist die Woche rum. Drum, ganz im Geiste unserer Generation: Was man heute kann besorgen, das verschiebe nicht auf morgen. \u{1F609}
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Am einfachsten gleich jetzt, solange du diese Mail noch offen hast:
    </p>

    <div style="margin:0 0 20px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 14px;">Per \u00dcberweisung</p>
      <table style="border-collapse:collapse;width:100%;table-layout:fixed;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;line-height:1.7;">
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;width:140px;">Empf\u00e4nger</td><td style="word-break:break-word;overflow-wrap:anywhere;">${escHtml(KONTOINHABER)}</td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;width:140px;">IBAN</td><td style="word-break:break-word;overflow-wrap:anywhere;"><span style="font-family:Courier,Menlo,monospace;letter-spacing:.04em;">${escHtml(IBAN)}</span></td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;width:140px;">Betrag</td><td style="word-break:break-word;overflow-wrap:anywhere;">10&nbsp;\u20ac pro angemeldeter Person (also z.&nbsp;B. 30&nbsp;\u20ac f\u00fcr drei Personen)</td></tr>
        <tr><td style="padding:2px 20px 2px 0;color:rgba(245,232,200,.55);white-space:nowrap;width:140px;vertical-align:top;">Verwendungszweck</td><td style="word-break:break-word;overflow-wrap:anywhere;">Emmerich boomt + dein Name<br><span style="font-size:13px;color:rgba(245,232,200,.55);">(z.&nbsp;B. \u201eEmmerich boomt \u2013 Maria Mustermann, 3 Personen\u201c)</span></td></tr>
      </table>
    </div>

    <div style="margin:0 0 32px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 10px;">Oder per PayPal</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.9);margin:0 0 8px;line-height:1.6;">
        Ganz bequem in unseren Sammel-Pool:<br>
        <a href="${escHtml(PAYPAL_LINK)}" style="color:#e8991a;font-family:Courier,Menlo,monospace;font-size:13px;word-break:break-all;">${escHtml(PAYPAL_LINK)}</a>
      </p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:rgba(245,232,200,.55);margin:0;line-height:1.6;">
        (Bitte 10&nbsp;\u20ac pro Person eintragen \u2013 bei drei Personen also 30&nbsp;\u20ac.)
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Sobald dein Beitrag da ist, bekommst du von uns die Best\u00e4tigung mit deinem Ticket. Dann ist alles in trockenen T\u00fcchern und du musst an nichts mehr denken.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 32px;">
      Bei Fragen \u2013 einfach auf diese Mail antworten.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:rgba(245,232,200,.8);line-height:1.8;margin:0 0 24px;">
      Bis bald auf dem B\u00f6lt,<br>
      Christoph Aldering f\u00fcr das Orga-Team \u201eEmmerich boomt!\u201c
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:rgba(245,232,200,.5);line-height:1.7;margin:0;">
      P.S. Ich hab \u00fcbrigens nicht geplant, mit den eingenommenen Millionen nach S\u00fcdamerika auszuwandern. Eine Kassenpr\u00fcfung findet selbstverst\u00e4ndlich statt!
    </p>

  </div>
</div>
</body>
</html>`;

  const text = [
    "Sch\u00f6n, dass du dabei bist!",
    "",
    "Deine Anmeldung f\u00fcr \u201eEmmerich boomt!\u201c ist angekommen \u2013 wir freuen uns drauf. Damit dein Platz fix ist, fehlt nur noch eins: der Beitrag von 10 \u20ac pro Person.",
    "",
    "Und jetzt kommt der Teil, bei dem wir uns selbst ein bisschen an die eigene Nase fassen: Wir wissen alle, wie das l\u00e4uft. Man nimmt sich vor, das \u201esp\u00e4ter\u201c zu machen \u2013 und dann kommt das Leben dazwischen, das Telefon klingelt, der Garten ruft, und schwupp ist die Woche rum. Drum, ganz im Geiste unserer Generation: Was man heute kann besorgen, das verschiebe nicht auf morgen. \ud83d\ude09",
    "",
    "Am einfachsten gleich jetzt, solange du diese Mail noch offen hast:",
    "",
    "Per \u00dcberweisung",
    `Empf\u00e4nger: ${KONTOINHABER}`,
    `IBAN: ${IBAN}`,
    "Betrag: 10 \u20ac pro angemeldeter Person (also z. B. 30 \u20ac f\u00fcr drei Personen)",
    "Verwendungszweck: Emmerich boomt + dein Name (z. B. \u201eEmmerich boomt \u2013 Maria Mustermann, 3 Personen\u201c)",
    "",
    "Oder per PayPal",
    "Ganz bequem in unseren Sammel-Pool:",
    PAYPAL_LINK,
    "(Bitte 10 \u20ac pro Person eintragen \u2013 bei drei Personen also 30 \u20ac.)",
    "",
    "Sobald dein Beitrag da ist, bekommst du von uns die Best\u00e4tigung mit deinem Ticket. Dann ist alles in trockenen T\u00fcchern und du musst an nichts mehr denken.",
    "",
    "Bei Fragen \u2013 einfach auf diese Mail antworten.",
    "",
    "Bis bald auf dem B\u00f6lt,",
    "Christoph Aldering f\u00fcr das Orga-Team \u201eEmmerich boomt!\u201c",
    "",
    "P.S. Ich hab \u00fcbrigens nicht geplant, mit den eingenommenen Millionen nach S\u00fcdamerika auszuwandern. Eine Kassenpr\u00fcfung findet selbstverst\u00e4ndlich statt!",
  ].join("\n");

  const { error } = await resend.emails.send({
    from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
    to:      [opts.to],
    replyTo: ABSENDER_MAIL,
    subject: "Sch\u00f6n, dass du dabei bist \u2013 nur noch ein kleiner Schritt \ud83c\udf89",
    html,
    text,
    attachments: [
      {
        filename:    "boomerpartyposter.jpeg",
        content:     getPosterBuffer(),
        contentType: "image/jpeg",
        contentId:   POSTER_CID,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${JSON.stringify(error)}`);
  }

  console.info("[Mailer] Bestätigungsmail versendet an", opts.to);
}

// ─── Ticket-Mail (Download-Links statt Anhänge) ───────────────────────────────

function buildBaseUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0]!.trim()}`;
  return "http://localhost:80";
}

interface TicketMailOptions {
  to:        string;
  personen:  string[];
  tickets:   { nummer: string; code: string; name: string }[];
  bezahlweg: string;
  betrag:    number;
}

export async function sendTicketMail(opts: TicketMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY nicht gesetzt — Ticket-Mail kann nicht versendet werden");
  }

  const resend = new Resend(apiKey);
  const base = buildBaseUrl();
  // Link to the ticket download page for the first ticket of this Anmeldung
  const ticketPageUrl = `${base}/boomer-orga-intern/ticket/${encodeURIComponent(opts.tickets[0]!.code)}`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Dein Ticket — EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:580px;margin:0 auto;">

    <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="580"
      style="display:block;width:100%;height:auto;" />

  <div style="padding:2.5rem 1.5rem;">

    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:1.3rem;font-weight:bold;color:#f5e8c8;margin:0 0 1.4rem;line-height:1.35;">
      Es ist so weit \u2014 dein Ticket ist da!
    </h2>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.2rem;">
      In dem Moment, wo wir diese Mail abschicken, freuen wir uns jedes Mal ein kleines bisschen mit. Weil dahinter ein echter Mensch steckt, der sich gedacht hat: <em>Ja, ich bin dabei.</em> Und das ist das Sch\u00F6nste an so einer Veranstaltung.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.4rem;">
      Dein Ticket kannst du hier herunterladen \u2014 als PDF zum Drucken oder als Bild f\u00FCrs Handy \u2014 sollte einfach funktionieren:
    </p>

    <div style="text-align:center;margin:0 0 1.8rem;">
      <a href="${escHtml(ticketPageUrl)}"
        style="display:inline-block;padding:0.75rem 2rem;background:#e8991a;border-radius:3px;font-family:Georgia,'Times New Roman',serif;font-size:1rem;font-weight:bold;color:#0a0704;text-decoration:none;letter-spacing:0.04em;">
        &#8594; Ticket herunterladen
      </a>
    </div>

    <p style="font-size:0.9rem;line-height:1.7;color:rgba(245,232,200,0.6);margin:0 0 1.8rem;font-style:italic;">
      Den QR-Code bitte am Einlass bereithalten.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.8rem;">
      <strong>Und eine kleine Bitte:</strong> K\u00F6nntest du kurz auf diese Mail antworten und uns wissen lassen, dass das Ticket bei dir angekommen ist? Ein \u201EHat geklappt!\u201C reicht v\u00F6llig \u2014 damit wir wissen, dass alles glatt gelaufen ist.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 2rem;">
      Wir sehen uns am 18. Juli auf dem B\u00F6lt. Es wird sch\u00F6n.
    </p>

    <p style="font-size:0.95rem;line-height:1.8;color:rgba(245,232,200,0.75);margin:0 0 2.5rem;">
      Herzliche Gr\u00FC\u00DFe,<br>
      Christoph Aldering f\u00FCr das Orga-Team \u201EEmmerich boomt!\u201C
    </p>

    <div style="padding-top:1.5rem;border-top:1px solid rgba(232,153,26,0.2);font-size:0.82rem;color:rgba(245,232,200,0.4);text-align:center;">
      EMMERICH BOOMT! \u00B7 18. Juli 2026 \u00B7 Emmerich am Rhein<br>
      <a href="https://www.emmerich-boomt.de" style="color:rgba(232,153,26,0.6);text-decoration:none;">www.emmerich-boomt.de</a>
    </div>
  </div>
  </div>
</body>
</html>`;

  const text = [
    "Es ist so weit \u2014 dein Ticket ist da!",
    "",
    "In dem Moment, wo wir diese Mail abschicken, freuen wir uns jedes Mal ein kleines bisschen mit. Weil dahinter ein echter Mensch steckt, der sich gedacht hat: Ja, ich bin dabei. Und das ist das Sch\u00F6nste an so einer Veranstaltung.",
    "",
    "Dein Ticket kannst du hier herunterladen \u2014 als PDF zum Drucken oder als Bild f\u00FCrs Handy \u2014 sollte einfach funktionieren:",
    "",
    `\u2192 Ticket herunterladen: ${ticketPageUrl}`,
    "",
    "Den QR-Code bitte am Einlass bereithalten.",
    "",
    "Und eine kleine Bitte: K\u00F6nntest du kurz auf diese Mail antworten und uns wissen lassen, dass das Ticket bei dir angekommen ist? Ein \u201EHat geklappt!\u201C reicht v\u00F6llig \u2014 damit wir wissen, dass alles glatt gelaufen ist.",
    "",
    "Wir sehen uns am 18. Juli auf dem B\u00F6lt. Es wird sch\u00F6n.",
    "",
    "Herzliche Gr\u00FC\u00DFe,",
    "Christoph Aldering f\u00FCr das Orga-Team \u201EEmmerich boomt!\u201C",
  ].join("\n");

  const { error } = await resend.emails.send({
    from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
    to:      [opts.to],
    replyTo: ABSENDER_MAIL,
    subject: "Dein Ticket wartet \u2014 EMMERICH BOOMT! 18. Juli 2026",
    html,
    text,
    attachments: [
      {
        filename:    "boomerpartyposter.jpeg",
        content:     getPosterBuffer(),
        contentType: "image/jpeg",
        contentId:   POSTER_CID,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${JSON.stringify(error)}`);
  }

  console.info("[Mailer] Ticket-Mail versendet an", opts.to);
}
