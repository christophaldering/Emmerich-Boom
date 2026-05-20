import { useState } from "react";
import { buildSortedPlaylist, getRevealInfo, formatTrackLabel, WishEntry, RevealInfo } from "@/lib/playlistArc";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function navigateToAnmeldung() {
  window.history.pushState({}, "", `${BASE}/anmeldung`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

interface RevealCardProps {
  reveal: RevealInfo;
  submittedSong: string;
  onScrollToPlaylist: () => void;
}

function RevealCard({ reveal, submittedSong, onScrollToPlaylist }: RevealCardProps) {
  const phaseColors: Record<string, string> = {
    "Ankommen":      "var(--fg-55)",
    "Aufwärmen":     "#b8860b",
    "Tanzfläche":    "var(--amber)",
    "Stimmungshoch": "var(--amber2)",
    "Finale":        "var(--amber)",
  };
  const phaseColor = phaseColors[reveal.phase.name] ?? "var(--amber)";

  return (
    <div style={{ textAlign: "center", padding: "1.5rem 0.5rem 2rem" }}>
      <style>{`
        @keyframes reveal-pop {
          0%   { opacity: 0; transform: translateY(12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .reveal-card { animation: reveal-pop 0.45s ease-out forwards; }
        .reveal-scroll-btn:hover { background: var(--amber) !important; color: var(--black) !important; }
      `}</style>

      <div className="reveal-card">
        <div style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>✦</div>

        <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.3rem, 4vw, 1.7rem)", color: "var(--warm)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
          Dein Song ist drin.
        </h3>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "var(--fg-55)", marginBottom: "2rem", fontStyle: "italic" }}>
          Das Orga-Team freut sich. Im Mai melden wir uns mit allen Details.
        </p>

        <div style={{ border: "1px solid var(--amber-30)", borderRadius: "6px", padding: "1.5rem 1.4rem", background: "var(--amber-05)", marginBottom: "1.8rem", textAlign: "left" }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.7, marginBottom: "0.8rem" }}>
            Die Song-Challenge
          </p>

          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.1rem, 3.5vw, 1.45rem)", color: "var(--warm)", marginBottom: "0.3rem", lineHeight: 1.3 }}>
            Platz {reveal.position} von {reveal.total}
          </p>

          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: phaseColor, fontWeight: 600, marginBottom: "0.2rem" }}>
            Phase: {reveal.phase.name}
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-55)", marginBottom: "1.3rem" }}>
            {reveal.phase.description}
          </p>

          {(reveal.prev || reveal.next) && (
            <div style={{ borderTop: "1px solid var(--fg-06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {reveal.prev && (
                <div style={{ fontFamily: "'Lora', serif", fontSize: "0.83rem", color: "var(--fg-55)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--fg-35)", fontSize: "0.75rem", display: "block", marginBottom: "0.1rem" }}>Kurz davor</span>
                  <span style={{ color: "var(--fg-75)" }}>{formatTrackLabel(reveal.prev)}</span>
                </div>
              )}
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "var(--amber)", fontWeight: 600, lineHeight: 1.5, padding: "0.25rem 0.6rem", background: "var(--amber-10)", borderRadius: "3px", borderLeft: "2px solid var(--amber)" }}>
                ♪ {submittedSong}
              </div>
              {reveal.next && (
                <div style={{ fontFamily: "'Lora', serif", fontSize: "0.83rem", color: "var(--fg-55)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--fg-35)", fontSize: "0.75rem", display: "block", marginBottom: "0.1rem" }}>Kurz danach</span>
                  <span style={{ color: "var(--fg-75)" }}>{formatTrackLabel(reveal.next)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onScrollToPlaylist}
          className="reveal-scroll-btn"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", color: "var(--amber)", background: "transparent", border: "1px solid var(--amber)", borderRadius: "3px", padding: "0.75rem 1.6rem", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
        >
          Zur Playlist ↓
        </button>

        <div style={{ borderTop: "1px solid var(--amber-20)", paddingTop: "2rem", marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          {["Von uns.", "Für uns.", "Wird Zeit."].map((line, i) => (
            <span key={i} style={{ display: "block", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 4.5vw, 2rem)", color: i === 1 ? "var(--amber)" : "var(--warm)", lineHeight: 1.4 }}>
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FormularProps {
  onSuccess?: (newId: number) => void;
}

export default function Formular({ onSuccess }: FormularProps) {
  const [submitted, setSubmitted] = useState(false);
  const [reveal, setReveal] = useState<RevealInfo | null>(null);
  const [submittedSong, setSubmittedSong] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", personen: "Nur ich", statement: "", song: "" });

  const inputStyle: React.CSSProperties = {
    background: "var(--fg-04)",
    border: "1px solid var(--fg-12)",
    borderRadius: "3px",
    color: "var(--warm)",
    padding: "0.75rem 0.9rem",
    fontSize: "1rem",
    fontFamily: "'Lora', serif",
    width: "100%",
    outline: "none",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/interesse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const songText = form.song.trim();
        setSubmittedSong(songText);
        setSubmitted(true);

        let newId: number | null = data.id ?? null;

        if (songText) {
          const computeReveal = (freshData: WishEntry[], id: number | null) => {
            const withSongs = freshData.filter((e) => e.song && e.song.trim() !== "");
            const resolvedId = id ?? (() => {
              const matched = freshData
                .filter((e) => e.name === form.name && e.song === form.song)
                .sort((a, b) => b.id - a.id);
              return matched[0]?.id ?? null;
            })();
            const sorted = buildSortedPlaylist(withSongs);
            if (resolvedId !== null) {
              setReveal(getRevealInfo(songText, resolvedId, sorted));
              onSuccess?.(resolvedId);
            } else {
              setReveal(getRevealInfo(songText, -1, sorted));
              onSuccess?.(0);
            }
          };

          try {
            const freshRes = await fetch("/api/interesse", { cache: "no-store" });
            const freshData: WishEntry[] = await freshRes.json();
            computeReveal(freshData, newId);
          } catch {
            const tempEntry: WishEntry = { id: newId ?? -1, name: form.name, song: songText };
            computeReveal([tempEntry], newId ?? -1);
          }
        } else {
          onSuccess?.(0);
        }
      } else if (data.duplicate) {
        setError(data.message);
      } else {
        setError(data.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte nochmal versuchen.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToPlaylist = () => {
    const el = document.getElementById("playlist");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="anmeldung" style={{ background: "var(--bg-section)", borderTop: "2px solid var(--amber-30)", borderBottom: "2px solid var(--amber-30)", padding: "3rem 0 5rem" }}>
      <style>{`
        .formular-input::placeholder { color: var(--fg-45); }
        .formular-input:focus { border-color: var(--amber-55) !important; }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .submit-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem" }}>

        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.78rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.7rem" }}>
            Interessensbekundung
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(2.2rem, 7vw, 3.2rem)", color: "var(--warm)", lineHeight: 1.15, marginBottom: "0.6rem" }}>
            Bist du dabei?
          </h2>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "1rem", color: "var(--fg-75)", lineHeight: 1.7 }}>
            Statement hinterlassen, Musikwunsch platzieren — unverbindlich.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "var(--amber-05)", border: "1px solid var(--amber-22)", borderRadius: "4px", padding: "0.9rem 1.1rem", marginBottom: "2rem", fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--fg-85)" }}>
          <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>🔒</span>
          <span>
            <strong style={{ color: "var(--amber)", fontWeight: 600 }}>Kein richtiger Name nötig.</strong>{" "}
            Ein Spitzname reicht völlig — keine E-Mail, keine Adresse, nichts Persönliches.
          </span>
        </div>

      {submitted && reveal ? (
        <RevealCard
          reveal={reveal}
          submittedSong={submittedSong}
          onScrollToPlaylist={handleScrollToPlaylist}
        />
      ) : submitted ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--amber)" }}>✦</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: "var(--warm)", marginBottom: "0.75rem" }}>
            Klasse. Daumen hoch angekommen.
          </h3>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-75)", lineHeight: 1.7, marginBottom: "2rem" }}>
            Das Orga-Team freut sich. Im Mai melden wir uns mit allen Details.
          </p>
          <div style={{ borderTop: "1px solid var(--amber-20)", paddingTop: "2rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            {["Von uns.", "Für uns.", "Wird Zeit."].map((line, i) => (
              <span key={i} style={{ display: "block", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 4.5vw, 2rem)", color: i === 1 ? "var(--amber)" : "var(--warm)", lineHeight: 1.4 }}>
                {line}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
          <div style={{ background: "var(--amber-08)", border: "1px solid var(--amber-30)", borderRadius: "4px", padding: "1rem 1.3rem", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--fg-80)" }}>
            <strong style={{ color: "var(--amber)", fontFamily: "'Lora', serif", fontWeight: 600 }}>Kein Ticket, kein Einlass.</strong>{" "}
            Das hier ist unverbindlich — für einen Platz brauchst du die verbindliche Anmeldung oben.
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem" }}>
              Vor- oder Spitzname{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-45)" }}>(reicht völlig)</em>
            </label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="z.B. Klaus, Uschi, Mausi ..." className="formular-input" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem" }}>
              Ungefähr wie viele seid ihr?
            </label>
            <select name="personen" value={form.personen} onChange={handleChange} className="formular-input" style={inputStyle}>
              <option>Nur ich</option>
              <option>Wir zwei</option>
              <option>Wir drei</option>
              <option>Vier auf einen Streich</option>
              <option>Fünf oder mehr</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem" }}>
              Kurzes Statement{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-45)" }}>(optional, aber gerne)</em>
            </label>
            <textarea name="statement" rows={3} value={form.statement} onChange={handleChange} placeholder={'Warum du dabei bist, was du dir erhoffst, oder einfach: "Bin dabei!"'} className="formular-input" style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem" }}>
              Dein Lieblingssong — der auf jeden Fall gespielt werden muss 🎵{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "var(--amber)", opacity: 0.85 }}>schon jetzt angeben!</em>
            </label>
            <input type="text" name="song" value={form.song} onChange={handleChange} placeholder="z.B. ABBA – Dancing Queen, Nena – 99 Luftballons ..." className="formular-input" style={inputStyle} />
            {form.song.trim().length > 2 && (
              <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "var(--amber)", opacity: 0.75, marginTop: "0.45rem", lineHeight: 1.5 }}>
                ✦ Abschicken — dann siehst du, wo dieser Song in der Playlist landet.
              </p>
            )}
          </div>

          {/* Warnbox + Anmelde-Button */}
          <div style={{ background: "var(--fg-03)", border: "1px solid var(--amber-30)", borderLeft: "3px solid var(--amber)", borderRadius: "0 4px 4px 0", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.92rem", lineHeight: 1.7, color: "var(--fg-80)", margin: 0 }}>
              🔔 <strong style={{ color: "var(--warm)" }}>Das ist keine Anmeldung.</strong> Eine Interessensbekundung sichert dir keinen Platz. Um wirklich dabei zu sein, direkt verbindlich anmelden.
            </p>
            <button
              type="button"
              onClick={navigateToAnmeldung}
              style={{ alignSelf: "flex-start", fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "var(--amber)", background: "transparent", border: "1px solid var(--amber-55)", borderRadius: "3px", padding: "0.45rem 1.1rem", cursor: "pointer" }}
            >
              → Zur verbindlichen Anmeldung
            </button>
          </div>

          <button type="submit" disabled={loading} className="submit-btn" style={{ width: "100%", padding: "1rem", background: "var(--amber)", border: "none", borderRadius: "3px", color: "var(--black)", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {loading ? "Wird gespeichert …" : "Bitte bestätigen! 👍"}
          </button>

          {error && (
            <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.88rem", lineHeight: 1.7 }}>
              {error}
            </div>
          )}
        </form>
      )}
      </div>
    </section>
  );
}
