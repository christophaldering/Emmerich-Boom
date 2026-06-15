import { useState, useRef } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function AnmeldungHeader() {
  function goHome() {
    window.history.pushState({}, "", `${BASE}/`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return (
    <>
      <style>{`
        .ah-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 8500;
          height: 48px;
          background: rgba(10,7,4,0.96);
          border-bottom: 1px solid rgba(232,153,26,0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.2rem;
          gap: 0.75rem;
        }
        .ah-back {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: rgba(232,153,26,0.55);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .ah-back:hover { color: rgba(232,153,26,0.9); }
        .ah-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-style: italic;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
          color: #E8991A;
          text-align: center;
          flex: 1;
        }
        .ah-date {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.72rem;
          color: rgba(245,232,200,0.35);
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        @media (max-width: 400px) { .ah-date { display: none; } }
      `}</style>
      <div className="ah-wrap">
        <button className="ah-back" onClick={goHome} aria-label="Zurück zur Startseite">
          ← Startseite
        </button>
        <span className="ah-title">Anmeldung</span>
        <span className="ah-date">18. Juli 2026</span>
      </div>
    </>
  );
}

import PressNote from "@/components/PressNote";
import Anmeldeformular from "@/components/Anmeldeformular";
import Erfolgsektion from "@/components/Erfolgsektion";
import LegalPhase2 from "@/components/LegalPhase2";
import { PHASE2_CONFIG } from "@/config/phase2";
import { HymneAudioProvider } from "@/contexts/HymneAudioContext";

function AnmeldungDemnächst() {
  return (
    <section style={{
      maxWidth: "640px",
      margin: "0 auto",
      padding: "4rem 2rem 6rem",
      textAlign: "center",
    }}>
      <div style={{
        display: "inline-block",
        border: "1px solid rgba(232,153,26,0.35)",
        borderRadius: "6px",
        padding: "2.5rem 2rem",
        background: "rgba(232,153,26,0.04)",
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
          color: "var(--amber)",
          marginBottom: "1rem",
          lineHeight: 1.3,
        }}>
          Anmeldung öffnet in Kürze
        </p>
        <p style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "1rem",
          color: "rgba(245,232,200,0.65)",
          lineHeight: 1.8,
          marginBottom: 0,
        }}>
          Wir stellen gerade die letzten Details fertig —<br />
          Kontoverbindung, Zahlungswege, Anmeldefrist.<br />
          Schaut in den nächsten Tagen nochmal rein.
        </p>
      </div>
    </section>
  );
}

export default function AnmeldungPage() {
  const [erfolg, setErfolg] = useState<{
    anzahl: number;
    personen: string[];
    ticket_nummern: number[];
  } | null>(null);
  const erfolgsRef = useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const urlEmail = searchParams.get("email") ?? undefined;
  const urlToken = searchParams.get("token") ?? undefined;
  const isNachruecker = !!urlToken;

  const handleSuccess = (data: { anzahl: number; personen: string[]; ticket_nummern: number[] }) => {
    setErfolg(data);
    setTimeout(() => {
      erfolgsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <HymneAudioProvider>
    <div style={{ background: "var(--black)", minHeight: "100svh", color: "var(--warm)" }}>
      <AnmeldungHeader />
      <div aria-hidden style={{ height: 48, flexShrink: 0 }} />

      {isNachruecker && !erfolg && (
        <div style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "1.5rem 2rem 0",
        }}>
          <div style={{
            border: "1px solid rgba(232,153,26,0.4)",
            borderLeft: "3px solid rgba(232,153,26,0.8)",
            borderRadius: "0 4px 4px 0",
            background: "rgba(232,153,26,0.05)",
            padding: "0.9rem 1.2rem",
            fontFamily: "'Lora', serif",
            fontSize: "0.92rem",
            color: "rgba(245,232,200,0.85)",
            lineHeight: 1.65,
          }}>
            🎉 Du rückst nach — ein Platz ist für dich reserviert. Füll das Formular aus und du bist dabei.
          </div>
        </div>
      )}

      {PHASE2_CONFIG.ANMELDUNG_AKTIV || isNachruecker ? (
        <>
          <Anmeldeformular
            onSuccess={handleSuccess}
            initialEmail={urlEmail}
            nachrueckerToken={urlToken}
          />
          {erfolg && (
            <div ref={erfolgsRef}>
              <Erfolgsektion
                anzahl={erfolg.anzahl}
                personen={erfolg.personen}
                ticket_nummern={erfolg.ticket_nummern}
              />
            </div>
          )}
        </>
      ) : (
        <AnmeldungDemnächst />
      )}

      <PressNote />
      <LegalPhase2 />
    </div>
    </HymneAudioProvider>
  );
}
