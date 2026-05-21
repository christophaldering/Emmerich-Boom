/**
 * Sendet zwei Test-Mails:
 *   1. Bestätigungsmail (Überweisung) — wie nach einer Anmeldung
 *   2. Ticket-Mail — mit Download-Button
 *
 * Verwendung:
 *   pnpm --filter @workspace/scripts run send-test-email [empfaenger@example.com]
 */

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

const POSTER_CID    = "boomerpartyposter";
const ABSENDER_MAIL = "boomerparty26@emmerich-boomt.de";
const ABSENDER_NAME = "Boomerparty Emmerich";
const KONTOINHABER  = "Christoph Aldering";
const IBAN          = "DE85120300001312386293";
const PAYPAL_LINK   = "https://www.paypal.com/pool/9pkJxWVmh2?sr=wccr";

// Basis-URL für Ticket-Download-Links
const domains = process.env["REPLIT_DOMAINS"];
const BASE_URL = domains
  ? `https://${domains.split(",")[0]!.trim()}`
  : "https://emmerich-boomt.de";

// ─── Test-Daten ───────────────────────────────────────────────────────────────

const TEST_PERSONEN       = ["Christoph Aldering", "Maria Musterfrau"];
const TEST_PERSONEN_ANZAHL = 2;
const TEST_BETRAG          = TEST_PERSONEN_ANZAHL * 10;
const TEST_CODE_1          = "TESTCODE00000001";
const TEST_CODE_2          = "TESTCODE00000002";

const attachments = [
  {
    filename:    "boomerpartyposter.jpeg",
    content:     posterBuffer,
    contentType: "image/jpeg" as const,
    contentId:   POSTER_CID,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  return (clean.match(/.{1,4}/g) ?? [clean]).join(" ");
}

// ─── Mail 1: Bestätigungsmail (Überweisung) ───────────────────────────────────

const bestaetigungHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Emmerich boomt! — Anmeldung</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;">
<div style="max-width:600px;margin:0 auto;">

  <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="600"
    style="display:block;width:100%;height:auto;" />

  <div style="padding:40px 32px 48px;">

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,153,26,.6);margin:0 0 18px;">
      ⚠ TEST-MAIL — kein echter Datensatz
    </p>

    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#f5e8c8;line-height:1.25;">
      Schön, dass du dabei bist!
    </h1>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Deine Anmeldung für „Emmerich boomt!" ist angekommen – wir freuen uns drauf.
      Damit dein Platz fix ist, fehlt nur noch eins: der Beitrag von 10&nbsp;€ pro Person.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Und jetzt kommt der Teil, bei dem wir uns selbst ein bisschen an die eigene Nase fassen:
      Wir wissen alle, wie das läuft. Man nimmt sich vor, das „später" zu machen – und dann
      kommt das Leben dazwischen, das Telefon klingelt, der Garten ruft, und schwupp ist die
      Woche rum. Drum, ganz im Geiste unserer Generation: Was man heute kann besorgen, das
      verschiebe nicht auf morgen. 😉
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 28px;">
      Am einfachsten gleich jetzt, solange du diese Mail noch offen hast:
    </p>

    <div style="margin:0 0 20px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 16px;">Per Überweisung</p>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Empfänger</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;">${escHtml(KONTOINHABER)}</div>
      </div>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">IBAN</div>
        <div style="font-family:Courier,Menlo,monospace;font-size:15px;letter-spacing:.04em;color:#f5e8c8;line-height:1.5;">${formatIban(IBAN)}</div>
      </div>

      <div style="margin:0 0 12px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Betrag</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;">${TEST_BETRAG}&nbsp;€ (${TEST_PERSONEN_ANZAHL}&nbsp;Personen × 10&nbsp;€)</div>
      </div>

      <div style="margin:0;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,153,26,.7);margin:0 0 2px;">Verwendungszweck</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#f5e8c8;line-height:1.5;">Emmerich boomt + dein Name</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:rgba(245,232,200,.55);line-height:1.5;margin-top:2px;">(z.&nbsp;B. „Emmerich boomt – Maria Mustermann, 3 Personen")</div>
      </div>
    </div>

    <div style="margin:0 0 32px;padding:20px 24px;border:1px solid rgba(232,153,26,.4);border-left:3px solid #e8991a;background:#120c04;border-radius:0 4px 4px 0;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#e8991a;margin:0 0 10px;">Oder per PayPal</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:rgba(245,232,200,.9);margin:0 0 8px;line-height:1.6;">
        Ganz bequem in unseren Sammel-Pool:<br>
        <a href="${escHtml(PAYPAL_LINK)}" style="color:#e8991a;font-family:Courier,Menlo,monospace;font-size:13px;word-break:break-all;">${escHtml(PAYPAL_LINK)}</a>
      </p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:rgba(245,232,200,.55);margin:0;line-height:1.6;">
        (Bitte 10&nbsp;€ pro Person eintragen – bei zwei Personen also 20&nbsp;€.)
      </p>
    </div>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 20px;">
      Sobald dein Beitrag da ist, bekommst du von uns die Bestätigung mit deinem Ticket
      (dieser Prozessschritt ist tatsächlich noch ganz manuell, deswegen kann es eine kleine
      Verzögerung geben – wir bitten um Verständnis). Dann ist alles in trockenen Tüchern
      und du musst an nichts mehr denken.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.75;color:rgba(245,232,200,.9);margin:0 0 32px;">
      Bei Fragen – einfach auf diese Mail antworten.
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:rgba(245,232,200,.8);line-height:1.8;margin:0 0 24px;">
      Bis bald auf dem Bölt,<br>
      Christoph Aldering für das Orga-Team „Emmerich boomt!"
    </p>

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:rgba(245,232,200,.5);line-height:1.7;margin:0;">
      P.S. Ich hab übrigens nicht geplant, mit den eingenommenen Millionen nach Südamerika
      auszuwandern. Eine Kassenprüfung findet selbstverständlich statt!
    </p>

  </div>
</div>
</body>
</html>`;

// ─── Mail 2: Ticket-Mail ──────────────────────────────────────────────────────

const ticketLinks = TEST_PERSONEN.map((name, i) => ({
  name,
  url: `${BASE_URL}/boomer-orga-intern/ticket/${i === 0 ? TEST_CODE_1 : TEST_CODE_2}`,
}));

const ticketButtonsHtml = ticketLinks.map(t =>
  `<div style="text-align:center;margin:0 0 0.9rem;">
    <a href="${escHtml(t.url)}"
      style="display:inline-block;padding:0.75rem 2rem;background:#e8991a;border-radius:3px;font-family:Georgia,'Times New Roman',serif;font-size:1rem;font-weight:bold;color:#0a0704;text-decoration:none;letter-spacing:0.04em;">
      &#8594; Ticket: ${escHtml(t.name)}
    </a>
  </div>`
).join("\n");

const ticketMailHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Eure Tickets — EMMERICH BOOMT!</title></head>
<body style="margin:0;padding:0;background:#0a0704;color:#f5e8c8;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:580px;margin:0 auto;">

    <img src="cid:${POSTER_CID}" alt="BoomerParty — Emmerich boomt!" width="580"
      style="display:block;width:100%;height:auto;" />

  <div style="padding:2.5rem 1.5rem;">

    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,153,26,.6);margin:0 0 18px;">
      ⚠ TEST-MAIL — Ticket-Codes existieren nicht in der DB
    </p>

    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:1.3rem;font-weight:bold;color:#f5e8c8;margin:0 0 1.4rem;line-height:1.35;">
      Es ist so weit — eure Tickets sind da!
    </h2>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.2rem;">
      In dem Moment, wo wir diese Mail abschicken, freuen wir uns jedes Mal ein kleines bisschen mit.
      Weil dahinter ein echter Mensch steckt, der sich gedacht hat: <em>Ja, ich bin dabei.</em>
      Und das ist das Schönste an so einer Veranstaltung.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.4rem;">
      Hier sind die Download-Links für alle ${ticketLinks.length} Tickets — bitte leitet sie an die jeweilige Person weiter:
    </p>

    <div style="margin:0 0 1.8rem;">
      ${ticketButtonsHtml}
    </div>

    <p style="font-size:0.9rem;line-height:1.7;color:rgba(245,232,200,0.6);margin:0 0 1.8rem;font-style:italic;">
      Den QR-Code bitte am Einlass bereithalten.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 1.8rem;">
      <strong>Und eine kleine Bitte:</strong> Könntest du kurz auf diese Mail antworten und uns
      wissen lassen, dass das Ticket bei dir angekommen ist? Ein „Hat geklappt!" reicht völlig —
      damit wir wissen, dass alles glatt gelaufen ist.
    </p>

    <p style="font-size:0.97rem;line-height:1.8;color:rgba(245,232,200,0.88);margin:0 0 2rem;">
      Wir sehen uns am 18. Juli auf dem Bölt. Es wird schön.
    </p>

    <p style="font-size:0.95rem;line-height:1.8;color:rgba(245,232,200,0.75);margin:0 0 2.5rem;">
      Herzliche Grüße,<br>
      Christoph Aldering für das Orga-Team „Emmerich boomt!"
    </p>

    <div style="padding-top:1.5rem;border-top:1px solid rgba(232,153,26,0.2);font-size:0.82rem;color:rgba(245,232,200,0.4);text-align:center;">
      EMMERICH BOOMT! · 18. Juli 2026 · Emmerich am Rhein<br>
      <a href="https://www.emmerich-boomt.de" style="color:rgba(232,153,26,0.6);text-decoration:none;">www.emmerich-boomt.de</a>
    </div>
  </div>
  </div>
</body>
</html>`;

// ─── Senden ───────────────────────────────────────────────────────────────────

const resend = new Resend(RESEND_API_KEY);

console.log(`\n[send-test-email] Ziel: ${TO}`);
console.log(`[send-test-email] Poster: ${POSTER_PATH} (${posterBuffer.length} Bytes)`);
console.log(`[send-test-email] Ticket-Base-URL: ${BASE_URL}\n`);

// Mail 1
console.log("[1/2] Sende Bestätigungsmail (Überweisung)…");
const { data: d1, error: e1 } = await resend.emails.send({
  from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
  to:      [TO],
  replyTo: ABSENDER_MAIL,
  subject: "[TEST] Schön, dass du dabei bist – nur noch ein kleiner Schritt 🎉",
  html:    bestaetigungHtml,
  text:    `TEST-MAIL\n\nBestätigungsmail mit Überweisungsdaten.\n\nEmpfänger: ${KONTOINHABER}\nIBAN: ${IBAN}\nBetrag: ${TEST_BETRAG} €\nPayPal: ${PAYPAL_LINK}`,
  attachments,
});
if (e1) {
  console.error("[1/2] ✗ Fehler:", JSON.stringify(e1, null, 2));
  process.exit(1);
}
console.log(`[1/2] ✓ Bestätigungsmail versendet. ID: ${d1?.id}\n`);

// Mail 2
console.log("[2/2] Sende Ticket-Mail…");
const { data: d2, error: e2 } = await resend.emails.send({
  from:    `${ABSENDER_NAME} <${ABSENDER_MAIL}>`,
  to:      [TO],
  replyTo: ABSENDER_MAIL,
  subject: "[TEST] Eure Tickets warten — EMMERICH BOOMT! 18. Juli 2026",
  html:    ticketMailHtml,
  text:    [
    `TEST-MAIL\n`,
    `Ticket-Links (Test-Codes, nicht in DB):`,
    ...ticketLinks.map(t => `→ ${t.name}: ${t.url}`),
    `\nWir sehen uns am 18. Juli auf dem Bölt.`,
  ].join("\n"),
  attachments,
});
if (e2) {
  console.error("[2/2] ✗ Fehler:", JSON.stringify(e2, null, 2));
  process.exit(1);
}
console.log(`[2/2] ✓ Ticket-Mail versendet. ID: ${d2?.id}\n`);

console.log(`✅ Beide Mails an ${TO} zugestellt.`);
