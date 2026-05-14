import nodemailer from "nodemailer";

const SENDER    = process.env.GMAIL_USER ?? "Christoph.aldering@googlemail.com";
const RECIPIENT = "Christoph.aldering@googlemail.com";

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
    from: `"Emmerich boomt" <${SENDER}>`,
    to: RECIPIENT,
    subject: `Tagesbericht Emmerich boomt — ${new Date().toLocaleDateString("de-DE")}`,
    text,
    html,
  });
  console.info("[Mailer] Tagesbericht versendet an", RECIPIENT);
}

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
  const transport = createTransport();
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
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;font-family:Georgia,'Times New Roman',serif;">
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

  const text = [
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
    from:    `"EMMERICH BOOMT!" <${SENDER}>`,
    to:      opts.to,
    subject: `${mehrere ? "Eure Tickets" : "Dein Ticket"} — EMMERICH BOOMT! 18. Juli 2026`,
    html,
    text,
  });

  console.info("[Mailer] Ticket-Mail versendet an", opts.to);
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
