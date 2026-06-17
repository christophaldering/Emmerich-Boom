// Server-seitige Eventconfig — spiegelt artifacts/emmerich/src/config/phase2.ts
// Beide Stellen bei Änderungen synchron halten (Follow-up #44 trackt das).

export const SERVER_CONFIG = {
  PREIS_PRO_PERSON:        10,
  ANMELDEFRIST:            "30. Juni 2026",
  KONTOINHABER:            "Christoph Aldering",
  BANK:                    "DKB",
  IBAN:                    "DE85120300001312386293",
  PAYPAL_LINK:             "https://www.paypal.com/pool/9pkJxWVmh2?sr=wccr",
  ABSENDER_MAIL:           "boomerparty26@emmerich-boomt.de",
  ABSENDER_NAME:           "Boomerparty Emmerich",
  THEKE_BASE_URL:          "https://emmerich-boomt.de",
  THEKE_DEMO_CODE:         "00000000DEADBEEF",
  THEKE_DEMO_EMAIL:        "orga-vorschau@emmerich-boomt.de",
  THEKE_FARZIN_CODE:       "FARZIN2026PREV00",
  // Freiticket-E-Mails — werden im öffentlichen Kapazitätszähler nicht mitgezählt
  THEKE_FREIKARTEN_EMAILS: [
    "akyel.events@gmail.com",       // Farzin
    "Sarah.Eul@funkemedien.de",     // Sarah Eul (Presse)
    "emmerich@rheinische-post.de",  // Christian Hagemann (Presse)
  ],
} as const;
