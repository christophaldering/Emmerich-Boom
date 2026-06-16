---
name: Theke-Szene Architektur
description: ThekePage.tsx Umbau von Tab-System zu atmosphärischer Szene (Stufe 1)
---

**Struktur** (ab diesem Umbau):
- Kein Tab-System. Alles in einer scrollbaren Szene.
- §2.1 Kopf: Greeting + Anwesenheits-Puls
- §2.2 WandDerGesichter: auto-fill grid mit GesichtKarte (3D-Flip via CSS backface-visibility)
- §2.3 Tresen: Bierdeckel-Button → ProfilOverlay; Telefon-Button (blinkt wenn Band-Einträge) → TelefonOverlay
- §2.4 Phasen: geschlossene Tür (Der Abend) + gestrichelter Rahmen (Danach) — rein visuell
- ProfilOverlay: fixed inset overlay mit MeinSteckbrief
- TelefonOverlay: fixed inset overlay mit DasBand + Anrufbeantworter

**Why:** Spec "Die Theke als Ort (Stufe 1)" — kein Formular-Interface, sondern atmosphärischer Raum.

**How to apply:** Beim nächsten ThekePage-Umbau (Stufe 2: Der Abend, Danach) die Overlay-Struktur beibehalten und nur die Phasen-Elemente aktivieren.
