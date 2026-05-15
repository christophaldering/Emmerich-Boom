// Server-seitige Eventconfig — spiegelt artifacts/emmerich/src/config/phase2.ts
// Beide Stellen bei Änderungen synchron halten (Follow-up #44 trackt das).

export const SERVER_CONFIG = {
  PREIS_PRO_PERSON:        10,
  ANMELDEFRIST:            "28. Juni 2026",
  KONTOINHABER:            "Christoph Aldering",
  BANK:                    "DKB",
  IBAN:                    "PLATZHALTER_IBAN",
  PAYPAL_LINK:             "PLATZHALTER_PAYPAL_LINK",
  ABSENDER_MAIL:           "boomerparty26@emmerich-boomt.de",
  ABSENDER_NAME:           "Boomerparty Emmerich",
} as const;
