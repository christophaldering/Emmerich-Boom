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

function buildBezahlBlock(bezahlweg: "ueberweisung" | "paypal", hauptname: string): { html: string; text: string } {
  const vz = `Boomerparty + ${hauptname}`;

  if (bezahlweg === "ueberweisung") {
    return {
      html: `
<div style="margin:24px 0;padding:16px 20px;border:1px solid #e8991a;border-radius:4px;background:#120c04;">
  <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#e8991a;">Bitte überweist bis spätestens ${ANMELDEFRIST}:</p>
  <table style="border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">Kontoinhaber</td><td>${escHtml(KONTOINHABER)}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">IBAN</td><td><span style="font-family:Courier,Menlo,monospace;letter-spacing:.05em;">${escHtml(IBAN)}</span></td></tr>
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">Bank</td><td>${escHtml(BANK)}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">Verwendungszweck</td><td><span style="font-family:Courier,Menlo,monospace;">${escHtml(vz)}</span></td></tr>
  </table>
</div>`,
      text: `Bitte überweist bis spätestens ${ANMELDEFRIST}:\n\nKontoinhaber: ${KONTOINHABER}\nIBAN: ${IBAN}\nBank: ${BANK}\nVerwendungszweck: ${vz}`,
    };
  }

  if (bezahlweg === "paypal") {
    return {
      html: `
<div style="margin:24px 0;padding:16px 20px;border:1px solid #e8991a;border-radius:4px;background:#120c04;">
  <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#e8991a;">Bitte sendet bis spätestens ${ANMELDEFRIST}:</p>
  <table style="border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#f5e8c8;">
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">PayPal-Link</td><td><a href="${escHtml(PAYPAL_LINK)}" style="color:#e8991a;font-family:Courier,Menlo,monospace;">${escHtml(PAYPAL_LINK)}</a></td></tr>
    <tr><td style="padding:3px 16px 3px 0;opacity:.6;">Verwendungszweck</td><td><span style="font-family:Courier,Menlo,monospace;">${escHtml(vz)}</span></td></tr>
  </table>
</div>`,
      text: `Bitte sendet bis spätestens ${ANMELDEFRIST}:\n\nPayPal-Link: ${PAYPAL_LINK}\nVerwendungszweck: ${vz}`,
    };
  }

  return {
    html: ``,
    text: ``,
  };
}

function buildTicketHinweis(bezahlweg: "ueberweisung" | "paypal"): { html: string; text: string } {
  return {
    html: `<p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.65);line-height:1.7;">Eure Tickets schicken wir euch im Juli per Mail — als PDF zum Ausdrucken oder fürs Handy.</p>`,
    text: "Eure Tickets schicken wir euch im Juli per Mail — als PDF zum Ausdrucken oder fürs Handy.",
  };
}

export async function sendBestaetigung(opts: BestaetigungsMailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY nicht gesetzt");
  }

  const resend = new Resend(apiKey);
  const hauptname = opts.personen[0] ?? "Unbekannt";
  const bezahlBlock = buildBezahlBlock(opts.bezahlweg, hauptname);
  const ticketHinweis = buildTicketHinweis(opts.bezahlweg);

  const personenListeHtml = opts.personen
    .map(p => `<li style="padding:2px 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;">${escHtml(p)}</li>`)
    .join("");

  const personenListeText = opts.personen.map(p => `- ${p}`).join("\n");

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Boomerparty — Anmeldung</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">

  <div style="margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(232,153,26,.25);">
    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#e8991a;">EMMERICH BOOMT!</p>
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#f5e8c8;line-height:1.2;">Wir haben euch.</h1>
  </div>

  <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#f5e8c8;margin:0 0 20px;">Hallo ${escHtml(hauptname)},</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:rgba(245,232,200,.85);margin:0 0 24px;">danke! Wir haben eure Anmeldung für die Boomerparty.</p>

  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#e8991a;letter-spacing:.08em;text-transform:uppercase;margin:0 0 8px;">${opts.personen_anzahl} ${opts.personen_anzahl === 1 ? "Person" : "Person(en)"} angemeldet:</p>
  <ul style="margin:0 0 8px;padding-left:20px;">
    ${personenListeHtml}
  </ul>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;margin:0 0 24px;">Macht zusammen <strong style="color:#e8991a;">${opts.betrag_gesamt}&nbsp;€</strong>.</p>

  ${bezahlBlock.html}

  ${ticketHinweis.html}

  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.55);line-height:1.7;margin:24px 0 0;font-style:italic;">Bei Fragen einfach auf diese Mail antworten.</p>

  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:rgba(245,232,200,.8);line-height:1.8;margin:28px 0 0;">Bis bald!<br><br>Christoph, Farzin &amp; Revse<br><span style="font-size:13px;color:rgba(245,232,200,.45);">— Orga BoomerParty 2026 —</span></p>

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(232,153,26,.15);text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:rgba(245,232,200,.35);">
    <a href="https://www.emmerich-boomt.de" style="color:#e8991a;text-decoration:none;">emmerich-boomt.de</a>
  </div>

</div>
</body>
</html>`;

  const text = [
    `Hallo ${hauptname},`,
    "",
    "danke! Wir haben eure Anmeldung für die Boomerparty.",
    "",
    `${opts.personen_anzahl} Person(en) angemeldet:`,
    personenListeText,
    "",
    `Macht zusammen ${opts.betrag_gesamt} €.`,
    "",
    bezahlBlock.text,
    "",
    ticketHinweis.text,
    "",
    "Bei Fragen einfach auf diese Mail antworten.",
    "",
    "Bis bald!",
    "",
    "Christoph, Farzin & Revse",
    "— Orga BoomerParty 2026 —",
    "emmerich-boomt.de",
  ].join("\n");

  const { error } = await resend.emails.send({
    from:     `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
    to:       [opts.to],
    replyTo:  ABSENDER_MAIL,
    subject:  "Wir haben euch — Boomerparty 18. Juli",
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${JSON.stringify(error)}`);
  }

  console.info("[Mailer] Bestätigungsmail versendet an", opts.to);
}

// ─── Gmail Ticket-Mail (Legacy) ───────────────────────────────────────────────

interface TicketMailOptions {
  to:        string;
  personen:  string[];
  tickets:   { nummer: string; code: string; name: string }[];
  bezahlweg: string;
  betrag:    number;
}

const BEZAHLWEG_LABEL: Record<string, string> = {
  ueberweisung: "Überweisung",
  paypal:       "PayPal",
};

export async function sendTicketMail(opts: TicketMailOptions): Promise<void> {
  const transport = createGmailTransport();
  if (!transport) {
    throw new Error("GMAIL_APP_PASSWORD nicht gesetzt — Ticket-Mail kann nicht versendet werden");
  }

  const ticketBlocks = opts.tickets
    .map(
      t => `
      <div style="
        background: #1a1108;
        border: 1px solid #c47a0e;
        border-left: 4px solid #e8991a;
        border-radius: 0 6px 6px 0;
        padding: 1.2rem 1.5rem;
        margin-bottom: 1rem;
        font-family: Georgia, 'Times New Roman', serif;
      ">
        <div style="font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #e8991a; margin-bottom: 0.5rem;">
          Ticket ${t.nummer}
        </div>
        <div style="font-size: 1.3rem; font-weight: bold; color: #f5e8c8; margin-bottom: 0.3rem;">
          ${escHtml(t.name)}
        </div>
        <div style="font-size: 0.88rem; color: rgba(245,232,200,0.7); margin-bottom: 0.8rem;">
          18. Juli 2026 · 19:00 Uhr<br>
          Bölt / Kapaunenberg · Emmerich am Rhein
        </div>
        <div style="font-family: monospace; font-size: 1rem; letter-spacing: 0.15em; color: #e8991a; background: rgba(232,153,26,0.08); padding: 0.5rem 0.8rem; border-radius: 4px; display: inline-block;">
          ${t.code}
        </div>
        <div style="font-size: 0.78rem; color: rgba(245,232,200,0.5); margin-top: 0.4rem; font-style: italic;">
          Bitte diesen Code am Einlass vorzeigen
        </div>
      </div>`,
    )
    .join("");

  const mehrere = opts.tickets.length > 1;
  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Euer Ticket — EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;font-family:'Playfair Display',Georgia,'Times New Roman',serif;">
  <div style="max-width:580px;margin:0 auto;padding:2.5rem 1.5rem;">

    <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(232,153,26,0.3);">
      <div style="font-size:0.72rem;letter-spacing:0.3em;text-transform:uppercase;color:#e8991a;margin-bottom:0.6rem;">
        Emmerich am Rhein · 18. Juli 2026
      </div>
      <div style="font-size:2.2rem;font-weight:bold;color:#f5e8c8;line-height:1.2;">
        EMMERICH BOOMT!
      </div>
      <div style="font-size:0.95rem;color:rgba(245,232,200,0.65);margin-top:0.4rem;">
        BoomerParty · Bölt / Kapaunenberg
      </div>
    </div>

    <p style="font-size:1.05rem;line-height:1.8;color:rgba(245,232,200,0.9);margin-bottom:0.5rem;">
      ${mehrere ? "Eure Tickets sind da." : "Dein Ticket ist da."}
    </p>
    <p style="font-size:0.92rem;line-height:1.7;color:rgba(245,232,200,0.65);margin-bottom:1.8rem;">
      ${opts.tickets.length} ${opts.tickets.length === 1 ? "Person" : "Personen"} ·
      ${BEZAHLWEG_LABEL[opts.bezahlweg] ?? opts.bezahlweg} ·
      ${opts.betrag} € gesamt
    </p>

    ${ticketBlocks}

    <p style="font-size:0.85rem;line-height:1.7;color:rgba(245,232,200,0.55);margin-top:2rem;font-style:italic;">
      Bitte den Ticket-Code am Einlass vorzeigen — entweder auf dem Handy
      oder ausgedruckt. Jedes Ticket gilt für genau eine Person.
    </p>

    <div style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(232,153,26,0.2);font-size:0.82rem;color:rgba(245,232,200,0.4);text-align:center;">
      EMMERICH BOOMT! · 18. Juli 2026 · Emmerich am Rhein<br>
      <a href="https://www.emmerich-boomt.de" style="color:rgba(232,153,26,0.6);text-decoration:none;">www.emmerich-boomt.de</a>
    </div>
  </div>
</body>
</html>`;

  const ticketText = [
    "EMMERICH BOOMT! — Eure Tickets",
    "18. Juli 2026 · 19:00 Uhr · Bölt / Kapaunenberg · Emmerich am Rhein",
    "",
    ...opts.tickets.map(
      t => `Ticket ${t.nummer} — ${t.name}\nCode: ${t.code}`,
    ),
    "",
    "Bitte den Code am Einlass vorzeigen.",
  ].join("\n");

  await transport.sendMail({
    from:    `"EMMERICH BOOMT!" <${GMAIL_SENDER}>`,
    to:      opts.to,
    subject: `${mehrere ? "Eure Tickets" : "Dein Ticket"} — EMMERICH BOOMT! 18. Juli 2026`,
    html,
    text:    ticketText,
  });

  console.info("[Mailer] Ticket-Mail versendet an", opts.to);
}
