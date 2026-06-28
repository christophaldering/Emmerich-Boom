import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { SERVER_CONFIG } from "../config.js";
import { logger } from "../lib/logger.js";

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
    logger.warn("GMAIL_APP_PASSWORD nicht gesetzt — Tagesbericht übersprungen");
    return;
  }
  await transport.sendMail({
    from: `"Emmerich boomt" <${GMAIL_SENDER}>`,
    to: GMAIL_RECIPIENT,
    subject: `Tagesbericht Emmerich boomt — ${new Date().toLocaleDateString("de-DE")}`,
    text,
    html,
  });
  logger.info({ to: GMAIL_RECIPIENT }, "Tagesbericht versendet");
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

function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  const groups = clean.match(/.{1,4}/g) ?? [clean];
  return groups.join(" ");
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
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Bestätigungsmail kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Emmerich boomt! — Anmeldung</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;"><tr><td bgcolor="#0a0704" style="background-color:#0a0704;">
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
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 16px;">Per \u00dcberweisung</p>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Empf\u00e4nger</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;word-break:break-word;overflow-wrap:anywhere;">${escHtml(KONTOINHABER)}</div>
      </div>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">IBAN</div>
        <div style="font-family:Courier,Menlo,monospace;font-size:15px;letter-spacing:.04em;color:#f5e8c8;line-height:1.5;word-break:break-all;">${formatIban(IBAN)}</div>
      </div>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Betrag</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;word-break:break-word;overflow-wrap:anywhere;">${opts.betrag_gesamt}&nbsp;\u20ac (${opts.personen_anzahl}&nbsp;${opts.personen_anzahl === 1 ? "Person" : "Personen"} \u00d7 10&nbsp;\u20ac)</div>
      </div>

      <div style="margin:0;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Verwendungszweck</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;word-break:break-word;overflow-wrap:anywhere;">Emmerich boomt + dein Name</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:rgba(245,232,200,.55);line-height:1.5;margin-top:2px;">(z.&nbsp;B. \u201eEmmerich boomt \u2013 Maria Mustermann, 3 Personen\u201c)</div>
      </div>
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
      Sobald dein Beitrag da ist, bekommst du von uns die Best\u00e4tigung mit deinem Ticket (dieser Prozess\u00ADschritt ist tats\u00e4chlich noch ganz manuell, deswegen kann es eine kleine Verz\u00f6gerung geben \u2013 wir bitten um Verst\u00e4ndnis). Dann ist alles in trockenen T\u00fcchern und du musst an nichts mehr denken.
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
</td></tr></table>
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
    `Betrag: ${opts.betrag_gesamt} \u20ac (${opts.personen_anzahl} ${opts.personen_anzahl === 1 ? "Person" : "Personen"} \u00d7 10 \u20ac)`,
    "Verwendungszweck: Emmerich boomt + dein Name (z. B. \u201eEmmerich boomt \u2013 Maria Mustermann, 3 Personen\u201c)",
    "",
    "Oder per PayPal",
    "Ganz bequem in unseren Sammel-Pool:",
    PAYPAL_LINK,
    "(Bitte 10 \u20ac pro Person eintragen \u2013 bei drei Personen also 30 \u20ac.)",
    "",
    "Sobald dein Beitrag da ist, bekommst du von uns die Best\u00e4tigung mit deinem Ticket (dieser Prozessschritt ist tats\u00e4chlich noch ganz manuell, deswegen kann es eine kleine Verz\u00f6gerung geben \u2013 wir bitten um Verst\u00e4ndnis). Dann ist alles in trockenen T\u00fcchern und du musst an nichts mehr denken.",
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

  logger.info({ to: opts.to }, "Bestätigungsmail versendet");
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
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Ticket-Mail kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt — Ticket-Mail kann nicht versendet werden");
  }

  const resend = new Resend(apiKey);
  const base = buildBaseUrl();

  const ticketLinks = opts.tickets.map(t => ({
    name: t.name,
    url: `${base}/boomer-orga-intern/ticket/${encodeURIComponent(t.code)}`,
  }));
  const mehrereTickets = ticketLinks.length > 1;
  const firstCode = opts.tickets[0]?.code;
  const uebersichtUrl = firstCode != null && opts.tickets.length > 0
    ? `${base}/boomer-orga-intern/ticket/${encodeURIComponent(firstCode)}/alle`
    : null;

  const ticketButtonsHtml = ticketLinks.map(t =>
    `<div style="text-align:center;margin:0 0 0.9rem;">
      <a href="${escHtml(t.url)}"
        style="display:inline-block;padding:0.75rem 2rem;background:#e8991a;border-radius:3px;font-family:Georgia,'Times New Roman',serif;font-size:1rem;font-weight:bold;color:#0a0704;text-decoration:none;letter-spacing:0.04em;">
        &#8594; ${mehrereTickets ? `Ticket: ${escHtml(t.name)}` : "Ticket herunterladen"}
      </a>
    </div>`
  ).join("\n");

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>${mehrereTickets ? "Eure Tickets" : "Dein Ticket"} \u2014 EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;"><tr><td bgcolor="#0a0704" style="background-color:#0a0704;">
  <div style="max-width:580px;margin:0 auto;">

    <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="580"
      style="display:block;width:100%;height:auto;" />

  <div style="padding:2.5rem 1.5rem;">

    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:1.3rem;font-weight:bold;color:#f5e8c8;margin:0 0 1.4rem;line-height:1.35;">
      Es ist so weit \u2014 ${mehrereTickets ? "eure Tickets sind da!" : "dein Ticket ist da!"}
    </h2>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.2rem;">
      In dem Moment, wo wir diese Mail abschicken, freuen wir uns jedes Mal ein kleines bisschen mit. Weil dahinter ein echter Mensch steckt, der sich gedacht hat: <em>Ja, ich bin dabei.</em> Und das ist das Sch\u00F6nste an so einer Veranstaltung.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.4rem;">
      ${mehrereTickets
        ? `Hier sind die Download-Links f\u00FCr alle ${ticketLinks.length} Tickets \u2014 bitte leitet sie an die jeweilige Person weiter:`
        : "Dein Ticket kannst du hier herunterladen \u2014 als PDF zum Drucken oder als Bild f\u00FCrs Handy \u2014 sollte einfach funktionieren:"
      }
    </p>

    ${uebersichtUrl ? `<div style="text-align:center;margin:0 0 1.4rem;">
      <a href="${escHtml(uebersichtUrl)}"
        style="display:inline-block;padding:0.75rem 2rem;background:#e8991a;border-radius:3px;font-family:Georgia,'Times New Roman',serif;font-size:1rem;font-weight:bold;color:#0a0704;text-decoration:none;letter-spacing:0.04em;">
        &#8594; ${mehrereTickets ? "Alle Tickets auf einen Blick" : "Ticket aufrufen"}
      </a>
    </div>` : ""}

    ${mehrereTickets && uebersichtUrl ? `<p style="font-size:0.87rem;line-height:1.7;color:rgba(245,232,200,0.55);margin:0 0 1.2rem;text-align:center;font-style:italic;">
      Oder einzeln:
    </p>` : ""}

    <div style="margin:0 0 1.8rem;">
      ${ticketButtonsHtml}
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
</td></tr></table>
</body>
</html>`;

  const ticketLinksText = mehrereTickets
    ? [
        `Hier sind die Download-Links f\u00FCr alle ${ticketLinks.length} Tickets \u2014 bitte leitet sie an die jeweilige Person weiter:`,
        "",
        ...(uebersichtUrl ? [`\u2192 Alle Tickets auf einen Blick: ${uebersichtUrl}`, ""] : []),
        ...ticketLinks.map(t => `\u2192 Ticket ${t.name}: ${t.url}`),
      ]
    : [
        "Dein Ticket kannst du hier herunterladen \u2014 als PDF zum Drucken oder als Bild f\u00FCrs Handy \u2014 sollte einfach funktionieren:",
        "",
        ...(uebersichtUrl ? [`\u2192 Ticket aufrufen: ${uebersichtUrl}`] : [`\u2192 Ticket herunterladen: ${ticketLinks[0]!.url}`]),
      ];

  const text = [
    `Es ist so weit \u2014 ${mehrereTickets ? "eure Tickets sind da!" : "dein Ticket ist da!"}`,
    "",
    "In dem Moment, wo wir diese Mail abschicken, freuen wir uns jedes Mal ein kleines bisschen mit. Weil dahinter ein echter Mensch steckt, der sich gedacht hat: Ja, ich bin dabei. Und das ist das Sch\u00F6nste an so einer Veranstaltung.",
    "",
    ...ticketLinksText,
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
    subject: mehrereTickets
      ? "Eure Tickets warten \u2014 EMMERICH BOOMT! 18. Juli 2026"
      : "Dein Ticket wartet \u2014 EMMERICH BOOMT! 18. Juli 2026",
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

  logger.info({ to: opts.to }, "Ticket-Mail versendet");
}

// ─── Zahlungserinnerung ───────────────────────────────────────────────────────

export interface ZahlungserinnerungOptions {
  to:              string;
  personen:        string[];   // vollständige Namen aller angemeldeten Personen
  anmeldedatum_de: string;
  frist_de:        string;
  betrag_gesamt:   number;
  personen_anzahl: number;
  bezahlweg:       "ueberweisung" | "paypal";
}

export async function sendZahlungserinnerung(opts: ZahlungserinnerungOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Zahlungserinnerung kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Kurze R\u00fcckmeldung erbeten \u00b7 EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;"><tr><td bgcolor="#0a0704" style="background-color:#0a0704;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty \u2014 Emmerich boomt!" width="600"
    style="display:block;width:100%;height:auto;" />

  <div style="padding:40px 32px 48px;">

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Liebe Boomerin, lieber Boomer,
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      kurze, freundliche Erinnerung: Unter dieser E-Mail-Adresse wurde am <strong>${escHtml(opts.anmeldedatum_de)}</strong> ${opts.personen_anzahl === 1 ? "eine Person" : `<strong>${opts.personen_anzahl}&nbsp;Personen</strong>`} f\u00fcr die BoomerParty am 18.&nbsp;Juli&nbsp;2026 angemeldet:<br>
      <span style="color:#e8991a;">${opts.personen.map(escHtml).join(", ")}</span><br>
      Sch\u00f6n, dass ${opts.personen_anzahl === 1 ? "du" : "ihr"} dabei sein ${opts.personen_anzahl === 1 ? "m\u00f6chtest" : "m\u00f6chtet"}! Seitdem konnten wir leider noch keinen Zahlungseingang zu dieser Anmeldung verbuchen.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Wir bitten dich daher um eine <strong>kurze R\u00fcckmeldung bis zum ${escHtml(opts.frist_de)}</strong>:
    </p>

    <div style="margin:0 0 16px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#e8991a;font-weight:bold;margin:0 0 14px;">Noch nicht bezahlt?</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.85);margin:0 0 16px;line-height:1.65;">Bitte den Betrag bis zum <strong>${escHtml(opts.frist_de)}</strong> begleichen \u2014 entweder per \u00dcberweisung oder per PayPal:</p>

      <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 8px;">Option 1 \u2014 Banküberweisung</p>
      <div style="margin:0 0 8px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Empf\u00e4nger</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">${escHtml(KONTOINHABER)}</div>
      </div>
      <div style="margin:0 0 8px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">IBAN</div>
        <div style="font-family:Courier,Menlo,monospace;font-size:14px;letter-spacing:.04em;color:#f5e8c8;">${escHtml(formatIban(IBAN))}</div>
      </div>
      <div style="margin:0 0 8px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Bank</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">${escHtml(BANK)}</div>
      </div>
      <div style="margin:0 0 8px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Betrag</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">${opts.betrag_gesamt}&nbsp;\u20ac (${opts.personen_anzahl}&nbsp;${opts.personen_anzahl === 1 ? "Person" : "Personen"} \u00d7 10&nbsp;\u20ac)</div>
      </div>
      <div style="margin:0 0 20px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Verwendungszweck</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">Boomerparty ${opts.personen.map(escHtml).join(" + ")}</div>
      </div>

      <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 8px;">Option 2 \u2014 PayPal</p>
      <div>
        <a href="${escHtml(PAYPAL_LINK)}" style="font-family:Courier,Menlo,monospace;font-size:13px;color:#e8991a;word-break:break-all;">${escHtml(PAYPAL_LINK)}</a>
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:rgba(245,232,200,.55);margin:6px 0 0;line-height:1.5;">Bitte genau ${opts.betrag_gesamt}&nbsp;\u20ac eintragen (${opts.personen_anzahl}&nbsp;\u00d7 10&nbsp;\u20ac).</p>
      </div>
    </div>

    <div style="margin:0 0 16px;padding:16px 24px;border:1px solid rgba(245,232,200,.12);border-left:3px solid rgba(245,232,200,.3);background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.85);margin:0;line-height:1.7;">
        <strong style="color:#f5e8c8;">Bereits \u00fcberwiesen?</strong> Dann melde dich kurz \u2014 m\u00f6glicherweise ist deine Zahlung nicht bei uns angekommen, und wir schauen gemeinsam nach, was passiert ist.
      </p>
    </div>

    <div style="margin:0 0 32px;padding:16px 24px;border:1px solid rgba(245,232,200,.12);border-left:3px solid rgba(245,232,200,.3);background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.85);margin:0;line-height:1.7;">
        <strong style="color:#f5e8c8;">Kein Interesse mehr?</strong> Auch das ist kein Problem \u2014 eine kurze Nachricht gen\u00fcgt, damit wir dein Ticket anderweitig vergeben k\u00f6nnen.
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Antworte einfach direkt auf diese Mail.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.85);margin:0 0 32px;">
      Wir haben noch eine l\u00e4ngere Warteliste. Sollten wir bis zum <strong>${escHtml(opts.frist_de)}</strong> keine R\u00fcckmeldung erhalten, w\u00fcrden wir dein Ticket leider an Interessierte von der Warteliste weitergeben m\u00fcssen.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:rgba(245,232,200,.8);line-height:1.8;margin:0 0 20px;">
      Herzliche Gr\u00fc\u00dfe,<br>
      Das BoomerParty-OrgaTeam<br>
      <a href="mailto:${escHtml(ABSENDER_MAIL)}" style="color:rgba(232,153,26,.7);text-decoration:none;">${escHtml(ABSENDER_MAIL)}</a>
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;font-style:italic;color:rgba(245,232,200,.35);line-height:1.7;margin:0;border-top:1px solid rgba(245,232,200,.08);padding-top:20px;">
      EMMERICH BOOMT! &bull; Samstag, 18. Juli 2026 &bull; B\u00f6lt / Gastst\u00e4tte Kapaunenberg &bull; Emmerich am Rhein
    </p>

  </div>
</div>
</td></tr></table>
</body>
</html>`;

  const personenListe = opts.personen.join(", ");
  const text = [
    "Liebe Boomerin, lieber Boomer,",
    "",
    `kurze, freundliche Erinnerung: Unter dieser E-Mail-Adresse wurde am ${opts.anmeldedatum_de} ${opts.personen_anzahl === 1 ? "eine Person" : `${opts.personen_anzahl} Personen`} f\u00fcr die BoomerParty am 18. Juli 2026 angemeldet: ${personenListe}. Sch\u00f6n, dass ${opts.personen_anzahl === 1 ? "du" : "ihr"} dabei sein ${opts.personen_anzahl === 1 ? "m\u00f6chtest" : "m\u00f6chtet"}! Seitdem konnten wir leider noch keinen Zahlungseingang zu dieser Anmeldung verbuchen.`,
    "",
    `Wir bitten dich daher um eine kurze R\u00fcckmeldung bis zum ${opts.frist_de}:`,
    "",
    "Noch nicht bezahlt?",
    `Bitte den Betrag bis zum ${opts.frist_de} begleichen \u2014 entweder per \u00dcberweisung oder per PayPal:`,
    "",
    "Option 1 \u2014 Banküberweisung:",
    `Empf\u00e4nger: ${KONTOINHABER}`,
    `IBAN: ${IBAN}`,
    `Bank: ${BANK}`,
    `Betrag: ${opts.betrag_gesamt} \u20ac (${opts.personen_anzahl} ${opts.personen_anzahl === 1 ? "Person" : "Personen"} \u00d7 10 \u20ac)`,
    `Verwendungszweck: Boomerparty ${opts.personen.join(" + ")}`,
    "",
    "Option 2 \u2014 PayPal:",
    `${PAYPAL_LINK}`,
    `Bitte genau ${opts.betrag_gesamt} \u20ac eintragen.`,
    "",
    "Bereits \u00fcberwiesen? Dann melde dich kurz \u2014 m\u00f6glicherweise ist deine Zahlung nicht bei uns angekommen, und wir schauen gemeinsam nach, was passiert ist.",
    "",
    "Kein Interesse mehr? Auch das ist kein Problem \u2014 eine kurze Nachricht gen\u00fcgt, damit wir dein Ticket anderweitig vergeben k\u00f6nnen.",
    "",
    "Antworte einfach direkt auf diese Mail.",
    "",
    `Wir haben noch eine l\u00e4ngere Warteliste. Sollten wir bis zum ${opts.frist_de} keine R\u00fcckmeldung erhalten, w\u00fcrden wir dein Ticket leider an Interessierte von der Warteliste weitergeben m\u00fcssen.`,
    "",
    "Herzliche Gr\u00fc\u00dfe,",
    "Das BoomerParty-OrgaTeam",
    ABSENDER_MAIL,
    "",
    "---",
    "EMMERICH BOOMT! \u00b7 Samstag, 18. Juli 2026 \u00b7 B\u00f6lt / Gastst\u00e4tte Kapaunenberg \u00b7 Emmerich am Rhein",
  ].join("\n");

  const { error } = await resend.emails.send({
    from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
    to:      [opts.to],
    replyTo: ABSENDER_MAIL,
    subject: "Freundliche Zahlungserinnerung \u00b7 EMMERICH BOOMT! \u00b7 18. Juli 2026",
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

  logger.info({ to: opts.to }, "Zahlungserinnerung versendet");
}

// ─── Wartelisten-Bestätigungsmail ─────────────────────────────────────────────

export interface WartelisteMailOptions {
  to: string;
}

export async function sendWartelisteBestaetigung(opts: WartelisteMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Wartelisten-Mail kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Warteliste · EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;"><tr><td bgcolor="#0a0704" style="background-color:#0a0704;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="600"
    style="display:block;width:100%;height:auto;" />

  <div style="padding:40px 32px 48px;">

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Du stehst auf der Warteliste.
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Wir haben deine Anfrage für die BoomerParty am <strong>18.&nbsp;Juli&nbsp;2026</strong> in Emmerich am Rhein erhalten.
      Alle Plätze sind gerade vergeben &mdash; aber manchmal tut sich noch was.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Sollte ein Platz frei werden, melden wir uns direkt bei dir &mdash; ohne dass du nochmal aktiv werden musst.
      Wir kennen das mit den vielen Mails. Ihr h\u00f6rt von uns, wenn es so weit ist.
    </p>

    <div style="margin:28px 0;padding:20px 24px;border:1px solid rgba(232,153,26,.25);border-left:3px solid rgba(232,153,26,.6);background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:rgba(245,232,200,.7);margin:0;">
        Bis dahin &mdash; und vielleicht bis bald.<br />
        <strong style="color:#f5e8c8;">Das Orga-Team</strong>
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.7;color:rgba(245,232,200,.35);margin:32px 0 0;border-top:1px solid rgba(245,232,200,.08);padding-top:20px;">
      EMMERICH BOOMT! &bull; Samstag, 18. Juli 2026 &bull; B\u00f6lt / Gasst\u00e4tte Kapaunenberg &bull; Emmerich am Rhein
    </p>

  </div>
</div>
</td></tr></table>
</body>
</html>`;

  const text = `Du stehst auf der Warteliste.

Wir haben deine Anfrage für die BoomerParty am 18. Juli 2026 in Emmerich am Rhein erhalten.
Alle Plätze sind gerade vergeben — aber manchmal tut sich noch was.

Sollte ein Platz frei werden, melden wir uns direkt bei dir — ohne dass du nochmal aktiv werden musst.

Bis dahin — und vielleicht bis bald.
Das Orga-Team

---
EMMERICH BOOMT! · Samstag, 18. Juli 2026 · Bölt / Gaststätte Kapaunenberg · Emmerich am Rhein`;

  const { error } = await resend.emails.send({
    from: `"${ABSENDER_NAME}" <${ABSENDER_MAIL}>`,
    to: opts.to,
    replyTo: ABSENDER_MAIL,
    subject: "Warteliste \u00b7 EMMERICH BOOMT! \u00b7 18. Juli 2026",
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

  logger.info({ to: opts.to }, "Wartelisten-Bestätigungsmail versendet");
}

// ─── Nachrücker-Einladungsmail ─────────────────────────────────────────────

export interface NachrueckerMailOptions {
  to: string;
  annehmenUrl: string;
  ablehnenUrl: string;
  fristText?: string;
}

export async function sendNachrueckerEinladung(opts: NachrueckerMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Nachrücker-Mail kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);
  const frist = opts.fristText ?? "48 Stunden";

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Nachrücker · EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;"><tr><td bgcolor="#0a0704" style="background-color:#0a0704;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="600"
    style="display:block;width:100%;height:auto;" />

  <div style="padding:40px 32px 48px;">

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Ein Platz ist frei &mdash; du kannst nachr&uuml;cken.
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Du stehst auf unserer Warteliste f&uuml;r die BoomerParty am <strong>18.&nbsp;Juli&nbsp;2026</strong> in Emmerich am Rhein.
      Es ist ein Platz frei geworden &mdash; und du bist dran.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Bitte entscheide dich innerhalb von <strong>${escHtml(frist)}</strong>:
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="padding-right:12px;">
          <a href="${escHtml(opts.annehmenUrl)}"
            style="display:inline-block;padding:14px 28px;background:#e8991a;color:#0a0704;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;text-decoration:none;border-radius:4px;">
            Ja, ich komme!
          </a>
        </td>
        <td>
          <a href="${escHtml(opts.ablehnenUrl)}"
            style="display:inline-block;padding:14px 28px;background:transparent;color:rgba(245,232,200,.55);border:1px solid rgba(245,232,200,.2);font-family:Georgia,'Times New Roman',serif;font-size:14px;text-decoration:none;border-radius:4px;">
            Nein, danke
          </a>
        </td>
      </tr>
    </table>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.7;color:rgba(245,232,200,.45);margin:0 0 28px;">
      Mit Klick auf &bdquo;Ja, ich komme!&ldquo; wirst du direkt zur Anmeldung weitergeleitet.<br />
      Wenn du nicht reagierst, verf&auml;llt der Platz nach ${escHtml(frist)}.
    </p>

    <div style="margin:28px 0;padding:20px 24px;border:1px solid rgba(232,153,26,.25);border-left:3px solid rgba(232,153,26,.6);background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:rgba(245,232,200,.7);margin:0;">
        Bis dann &mdash; hoffentlich auf der Party.<br />
        <strong style="color:#f5e8c8;">Das Orga-Team</strong>
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.7;color:rgba(245,232,200,.35);margin:32px 0 0;border-top:1px solid rgba(245,232,200,.08);padding-top:20px;">
      EMMERICH BOOMT! &bull; Samstag, 18. Juli 2026 &bull; B&ouml;lt / Gasst&auml;tte Kapaunenberg &bull; Emmerich am Rhein
    </p>

  </div>
</div>
</td></tr></table>
</body>
</html>`;

  const text = `Ein Platz ist frei — du kannst nachrücken.

Du stehst auf unserer Warteliste für die BoomerParty am 18. Juli 2026 in Emmerich am Rhein.
Es ist ein Platz frei geworden — und du bist dran.

Bitte entscheide dich innerhalb von ${frist}:

→ JA, ich komme: ${opts.annehmenUrl}

→ Nein, danke: ${opts.ablehnenUrl}

Wenn du nicht reagierst, verfällt der Platz nach ${frist}.

Bis dann — hoffentlich auf der Party.
Das Orga-Team

---
EMMERICH BOOMT! · Samstag, 18. Juli 2026 · Bölt / Gaststätte Kapaunenberg · Emmerich am Rhein`;

  const { error } = await resend.emails.send({
    from: `"${ABSENDER_NAME}" <${ABSENDER_MAIL}>`,
    to: opts.to,
    replyTo: ABSENDER_MAIL,
    subject: "Ein Platz ist frei \u00b7 EMMERICH BOOMT! \u00b7 18. Juli 2026",
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

  logger.info({ to: opts.to }, "Nachrücker-Einladungsmail versendet");
}

// ─── Theke-Einladungsmail ─────────────────────────────────────────────────────

export interface ThekeEinladungMailOptions {
  to: string;
  tickets: { name: string; code: string }[];
}

export async function sendThekeEinladung(opts: ThekeEinladungMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error({ to: opts.to }, "RESEND_API_KEY nicht gesetzt — Theke-Mail kann nicht versendet werden");
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);
  const baseUrl = SERVER_CONFIG.THEKE_BASE_URL;

  const mehrere = opts.tickets.length > 1;

  const ticketBloecke = opts.tickets.map(t => {
    const link = `${baseUrl}/theke?t=${encodeURIComponent(t.code)}`;
    const waText = mehrere ? `Hier ist dein Zugang zur Theke: ${link}` : `Mein Zugang zur Theke: ${link}`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    const mailLink = `mailto:?subject=${encodeURIComponent("Dein Zugang zur Theke – EMMERICH BOOMT!")}&body=${encodeURIComponent(`Hallo,\n\nhier ist dein persönlicher Zugang zur Theke:\n${link}\n\nBis bald auf dem Bölt!`)}`;
    return `
    <div style="margin:0 0 24px;padding:20px 24px;border:1px solid rgba(232,153,26,.35);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#e8991a;margin:0 0 10px;">${escHtml(t.name)}</p>
      <p style="font-family:Courier,Menlo,monospace;font-size:13px;color:rgba(245,232,200,.6);word-break:break-all;margin:0 0 14px;">${escHtml(link)}</p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:10px;">
            <a href="${escHtml(link)}" style="display:inline-block;padding:10px 22px;background:#e8991a;color:#0a0704;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:3px;">Zur Theke</a>
          </td>
          <td style="padding-right:10px;">
            <a href="${escHtml(waLink)}" style="display:inline-block;padding:10px 18px;background:transparent;color:rgba(245,232,200,.6);border:1px solid rgba(245,232,200,.2);font-family:Georgia,'Times New Roman',serif;font-size:13px;text-decoration:none;border-radius:3px;">${mehrere ? "Weiterleiten" : "Aufs Handy"}</a>
          </td>
          <td>
            <a href="${escHtml(mailLink)}" style="display:inline-block;padding:10px 18px;background:transparent;color:rgba(245,232,200,.6);border:1px solid rgba(245,232,200,.2);font-family:Georgia,'Times New Roman',serif;font-size:13px;text-decoration:none;border-radius:3px;">${mehrere ? "Per Mail" : "An mich"}</a>
          </td>
        </tr>
      </table>
    </div>`;
  }).join("\n");

  const ticketBloeckeText = opts.tickets.map(t => {
    const link = `${baseUrl}/theke?t=${encodeURIComponent(t.code)}`;
    return `${t.name}\n→ ${link}\n`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Die Theke ist offen \u2014 EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background-color:#0a0704;color:#f5e8c8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="background-color:#0a0704;margin:0;padding:0;">
<tr><td align="center" bgcolor="#0a0704" style="padding:0;background-color:#0a0704;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0704" style="width:100%;max-width:600px;background-color:#0a0704;">

  <tr><td style="padding:0;font-size:0;line-height:0;">
    <img src="cid:${POSTER_CID}" alt="BoomerParty \u2014 Emmerich boomt!" width="600"
      style="display:block;width:100%;max-width:600px;height:auto;" />
  </td></tr>

  <tr><td bgcolor="#0a0704" style="padding:40px 32px 48px;background-color:#0a0704;">

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Vorfreude ist ja bekanntlich die schönste Freude.
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Über 250 Boomer wollen am 18. Juli mitfeiern. Über 250! Da steht man dann am Bölt, schaut sich um – und fragt sich unweigerlich: Wer kommt eigentlich alles? Wen kenne ich? Und wen erkenne ich nach all den Jahren überhaupt noch wieder?
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Damit das ein bisschen leichter wird, kommt hier eine Idee: die digitale Theke.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Dort kann jede und jeder ein kleines Kurzprofil hinterlegen – ein Foto von früher, ein Foto von heute, ein paar Zeilen zu sich. So sieht man schon vorab, wer da ist, frischt das Gedächtnis auf und hat am Abend gleich Gesprächsstoff. ("Mensch, das bist DU?")
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Schön wäre, wenn möglichst viele mitmachen. Müssen tut aber niemand. Wer keine Lust hat, lässt es einfach. Wer es sich anders überlegt, löscht sein Profil mit einem Klick wieder. Alles freiwillig, alles in deiner Hand.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Schau ruhig immer wieder mal rein. Die Theke füllt sich mit jedem Tag, und es macht Spaß zu sehen, wer alles dazukommt.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      ${mehrere ? "Du hast mehrere Zugänge bekommen — leite jeden Link einfach an die passende Person weiter." : "Der Link gehört nur dir."}
    </p>

    ${ticketBloecke}

    <div style="margin:28px 0;padding:20px 24px;border:1px solid rgba(232,153,26,.25);border-left:3px solid rgba(232,153,26,.6);background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:rgba(245,232,200,.7);margin:0;">
        Bis bald auf dem Bölt.<br />
        <strong style="color:#f5e8c8;">Das Orga-Team</strong>
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.7;color:rgba(245,232,200,.35);margin:32px 0 0;border-top:1px solid rgba(245,232,200,.08);padding-top:20px;">
      EMMERICH BOOMT! &bull; Samstag, 18. Juli 2026 &bull; Bölt / Gaststätte Kapaunenberg &bull; Emmerich am Rhein
    </p>

  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Vorfreude ist ja bekanntlich die schönste Freude.

Über 250 Boomer wollen am 18. Juli mitfeiern. Über 250! Da steht man dann am Bölt, schaut sich um – und fragt sich unweigerlich: Wer kommt eigentlich alles? Wen kenne ich? Und wen erkenne ich nach all den Jahren überhaupt noch wieder?

Damit das ein bisschen leichter wird, kommt hier eine Idee: die digitale Theke.

Dort kann jede und jeder ein kleines Kurzprofil hinterlegen – ein Foto von früher, ein Foto von heute, ein paar Zeilen zu sich. So sieht man schon vorab, wer da ist, frischt das Gedächtnis auf und hat am Abend gleich Gesprächsstoff. ("Mensch, das bist DU?")

Schön wäre, wenn möglichst viele mitmachen. Müssen tut aber niemand. Wer keine Lust hat, lässt es einfach. Wer es sich anders überlegt, löscht sein Profil mit einem Klick wieder. Alles freiwillig, alles in deiner Hand.

Schau ruhig immer wieder mal rein. Die Theke füllt sich mit jedem Tag, und es macht Spaß zu sehen, wer alles dazukommt.

${mehrere ? "Du hast mehrere Zugänge bekommen — leite jeden Link einfach an die passende Person weiter." : "Der Link gehört nur dir."}

${ticketBloeckeText}
Bis bald auf dem Bölt.
Das Orga-Team

---
EMMERICH BOOMT! · Samstag, 18. Juli 2026 · Bölt / Gaststätte Kapaunenberg · Emmerich am Rhein`;

  const { error } = await resend.emails.send({
    from: `"${ABSENDER_NAME}" <${ABSENDER_MAIL}>`,
    to: opts.to,
    replyTo: ABSENDER_MAIL,
    subject: "Vorfreude ist die schönste Freude: die Theke füllt sich",
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

  logger.info({ to: opts.to, tickets: opts.tickets.length }, "Theke-Einladungsmail versendet");
}
