import { useEffect, useRef, useState, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const A = "#E8991A";
const BG = "#0A0704";
const FG = "#F5E8C8";
const fg = (o: number) => `rgba(245,232,200,${o})`;
const am = (o: number) => `rgba(232,153,26,${o})`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketInfo { id: number; person_name: string; ticket_nummer: string; }
interface Profile {
  id: number;
  anmeldung_ticket_id: number;
  anzeige_name: string;
  bestaetigt: boolean;
  vorstellung?: string | null;
  jahr_1985?: string | null;
  lauter_song?: string | null;
  f_tontraeger?: string | null;
  f_abends?: string | null;
  f_untersatz?: string | null;
  f_musik?: string | null;
  f_getraenk?: string | null;
  foto_frueher_key?: string | null;
  foto_frueher_jahr?: number | null;
  foto_heute_key?: string | null;
  foto_heute_jahr?: number | null;
  sichtbarkeit_zugestimmt_am?: string | null;
  abendfotos_ok: boolean;
}
interface Foto { id: number; datei_key: string; bildunterschrift?: string | null; jahr?: number | null; sichtbar_ok: boolean; }
interface Botschaft { id: number; datei_key: string; dauer_sek: number; anmeldung_ticket_id: number; }
interface FeedEntry extends Profile {
  fotos: Foto[];
  hat_botschaft: boolean;
}
interface BandEntry {
  id: number; datei_key: string; dauer_sek: number;
  anmeldung_ticket_id: number; anzeige_name: string; created_at: string;
}

// ─── Spec Constants ───────────────────────────────────────────────────────────

const TONTRAEGER_OPTS   = ["Schallplatte", "Kassette", "CD", "MP3-Player", "Streaming"];
const ABENDS_OPTS       = ["Kneipe", "Disko / Club", "Konzert", "Kino", "Zuhause auf der Couch"];
const UNTERSATZ_OPTS    = ["Fahrrad", "Moped/Motorrad", "Auto", "Bus & Bahn", "Zu Fuß"];
const MUSIK_OPTS        = ["Schlager", "Rock / Metal", "Pop", "Hip-Hop / R'n'B", "Jazz / Blues", "Klassik", "Alles irgendwie"];
const GETRAENK_OPTS     = ["Bier", "Wein", "Sekt / Prosecco", "Cocktail / Longdrink", "Softdrink / Wasser"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fotoUrl(key: string, token: string) {
  return `${BASE}/api/theke/datei/${key}?t=${encodeURIComponent(token)}`;
}

function noindex() {
  let meta = document.head.querySelector<HTMLMetaElement>("meta[name='robots'][data-theke]");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "robots";
    meta.setAttribute("data-theke", "1");
    document.head.appendChild(meta);
  }
  meta.content = "noindex,nofollow";
}
function removeNoindex() {
  document.head.querySelector("meta[name='robots'][data-theke]")?.remove();
}

// ─── Sperrseite ───────────────────────────────────────────────────────────────

function Sperrseite() {
  return (
    <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "480px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 5vw, 2rem)", color: A, marginBottom: "1.2rem" }}>
          Kein Zugang.
        </p>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", lineHeight: 1.75, color: fg(0.65) }}>
          Die Theke ist nur über deinen persönlichen Link erreichbar. Den findest du in der Ticket-Mail.
        </p>
      </div>
    </div>
  );
}

// ─── Name-Bestätigung ─────────────────────────────────────────────────────────

function NamenseingabeDialog({ personName, onConfirm }: { personName: string; onConfirm: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(personName);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    onConfirm(editing && input.trim().length >= 2 ? input.trim() : personName);
  };

  return (
    <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "480px", width: "100%" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 5vw, 2rem)", color: A, marginBottom: "1.4rem" }}>
          Willkommen in der Theke.
        </p>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", lineHeight: 1.75, color: fg(0.85), marginBottom: "2rem" }}>
          Du bist eingetragen als: <strong style={{ color: FG }}>{personName}</strong>. Stimmt das so?
        </p>
        {!editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <button onClick={() => confirm()}
              disabled={saving}
              style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.05rem", padding: "0.9rem 2rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              Ja, stimmt so
            </button>
            <button onClick={() => setEditing(true)}
              style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "4px", color: fg(0.7), fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "1rem", padding: "0.75rem 2rem", cursor: "pointer" }}>
              Nein, ich möchte einen anderen Namen
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input
              type="text"
              value={input}
              maxLength={80}
              onChange={e => setInput(e.target.value)}
              autoFocus
              placeholder="Dein Anzeigename"
              style={{ background: am(0.07), border: `1px solid ${am(0.35)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "1rem", padding: "0.75rem 1rem", outline: "none" }}
            />
            <button onClick={() => confirm()}
              disabled={input.trim().length < 2 || saving}
              style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.05rem", padding: "0.9rem 2rem", cursor: input.trim().length < 2 || saving ? "not-allowed" : "pointer", opacity: input.trim().length < 2 || saving ? 0.6 : 1 }}>
              {saving ? "Speichern …" : "So bin ich dabei"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Auswahl-Feld ─────────────────────────────────────────────────────────────

function AuswahlFeld({ label, opts, value, onChange }: { label: string; opts: string[]; value: string | null | undefined; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8), marginBottom: "0.75rem" }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {opts.map(opt => {
          const sel = value === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)}
              style={{
                background: sel ? A : am(0.08),
                border: `1px solid ${sel ? A : am(0.3)}`,
                borderRadius: "20px",
                color: sel ? BG : fg(0.8),
                fontFamily: "'Lora', serif",
                fontSize: "0.9rem",
                padding: "0.4rem 1rem",
                cursor: "pointer",
                fontWeight: sel ? 700 : 400,
                transition: "all 0.15s",
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Foto-Slot (Früher/Heute) ──────────────────────────────────────────────────

function FotoSlot({ label, fileKey, jahr, token, onUpload, accept = "image/*" }: {
  label: string; fileKey?: string | null; jahr?: number | null;
  token: string; onUpload: (file: File, jahr?: number) => void; accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jahrInput, setJahrInput] = useState(String(jahr ?? ""));

  return (
    <div style={{ position: "relative", background: am(0.07), border: `1px solid ${am(0.25)}`, borderRadius: "6px", overflow: "hidden", aspectRatio: "3/4", cursor: "pointer" }}
      onClick={() => inputRef.current?.click()}>
      {fileKey ? (
        <>
          <img src={fotoUrl(fileKey, token)} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.75) 0%, transparent 60%)" }} />
          {jahr && (
            <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.6rem", color: A, textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
              {jahr}
            </div>
          )}
          <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: am(0.7), borderRadius: "3px", padding: "0.2rem 0.5rem", fontFamily: "'Lora', serif", fontSize: "0.75rem", color: BG }}>
            Ändern
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "2rem", opacity: 0.4 }}>📷</span>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.5), fontStyle: "italic" }}>{label}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) {
            const j = jahrInput ? parseInt(jahrInput, 10) : undefined;
            onUpload(f, isNaN(j ?? NaN) ? undefined : j);
          }
          e.target.value = "";
        }}
      />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(10,7,4,0.85)", padding: "0.4rem 0.6rem" }}
        onClick={e => e.stopPropagation()}>
        <input
          type="number"
          placeholder="Jahr (z.B. 1992)"
          value={jahrInput}
          min={1940}
          max={2030}
          onChange={e => setJahrInput(e.target.value)}
          style={{ width: "100%", background: "transparent", border: "none", color: fg(0.6), fontFamily: "'Lora', serif", fontSize: "0.8rem", outline: "none", textAlign: "center" }}
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

// ─── Anrufbeantworter ─────────────────────────────────────────────────────────

function Anrufbeantworter({ token, botschaft, onUploaded, onDeleted }: {
  token: string;
  botschaft: Botschaft | null;
  onUploaded: (b: Botschaft) => void;
  onDeleted: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "countdown" | "aufnahme" | "wiedergabe" | "speichern">("idle");
  const [sek, setSek] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const beepCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      beepCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.7);
    } catch { }
  }, []);

  const startAufnahme = useCallback(async () => {
    setError("");
    setPhase("countdown");
    playBeep();
    await new Promise(r => setTimeout(r, 900));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"].find(m => MediaRecorder.isTypeSupported(m)) ?? "";
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioBlobUrl(url);
        setPhase("wiedergabe");
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start(100);
      setPhase("aufnahme");
      setSek(0);
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        setSek(elapsed);
        if (elapsed >= 60) {
          rec.stop();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);
    } catch (err) {
      setError("Mikrofon-Zugriff verweigert.");
      setPhase("idle");
    }
  }, [playBeep]);

  const stopAufnahme = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  const neu = () => {
    if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    setAudioBlobUrl(null);
    setAudioBlob(null);
    setSek(0);
    setPhase("idle");
  };

  const speichern = async () => {
    if (!audioBlob) return;
    setPhase("speichern");
    try {
      const form = new FormData();
      const ext = audioBlob.type.includes("ogg") ? "ogg" : audioBlob.type.includes("mp4") ? "mp4" : "webm";
      form.append("audio", audioBlob, `botschaft.${ext}`);
      form.append("dauer_sek", String(sek));
      const res = await fetch(`${BASE}/api/theke/audio`, {
        method: "POST",
        headers: { "x-theke-token": token },
        body: form,
      });
      const data = await res.json() as { ok?: boolean; botschaft?: Botschaft; error?: string };
      if (data.ok && data.botschaft) {
        onUploaded(data.botschaft);
        setPhase("idle");
        if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
        setAudioBlobUrl(null);
      } else {
        setError(data.error ?? "Fehler beim Speichern");
        setPhase("wiedergabe");
      }
    } catch {
      setError("Verbindungsfehler");
      setPhase("wiedergabe");
    }
  };

  const loeschen = async () => {
    if (!botschaft) return;
    await fetch(`${BASE}/api/theke/audio/${botschaft.id}`, {
      method: "DELETE",
      headers: { "x-theke-token": token },
    });
    onDeleted();
  };

  const botschaftUrl = botschaft ? `${BASE}/api/theke/datei/${botschaft.datei_key}?t=${encodeURIComponent(token)}` : null;

  return (
    <div style={{ border: `1px solid ${am(0.3)}`, borderRadius: "8px", padding: "1.5rem", background: am(0.06) }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "1rem" }}>
        Anrufbeantworter — max. 60 Sekunden
      </p>
      <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.6), lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Hinterlass eine kurze Sprachnachricht — wer du bist, was du erwartest, was du mitbringst. Wird für alle Ticketinhaber hörbar.
      </p>

      {error && <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#e05a3a", marginBottom: "1rem" }}>{error}</p>}

      {botschaft && phase === "idle" && (
        <div style={{ marginBottom: "1.25rem", padding: "1rem", background: BG, borderRadius: "6px", border: `1px solid ${am(0.2)}` }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.55), marginBottom: "0.5rem" }}>Aktuelle Nachricht ({botschaft.dauer_sek}s):</p>
          <audio controls src={botschaftUrl!} style={{ width: "100%", marginBottom: "0.75rem" }} />
          <button onClick={loeschen}
            style={{ background: "transparent", border: "1px solid rgba(220,80,50,0.45)", borderRadius: "4px", color: "rgba(220,80,50,0.8)", fontFamily: "'Lora', serif", fontSize: "0.85rem", padding: "0.4rem 0.9rem", cursor: "pointer" }}>
            Löschen
          </button>
        </div>
      )}

      {phase === "idle" && (
        <button onClick={startAufnahme}
          style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1rem", padding: "0.8rem 1.8rem", cursor: "pointer" }}>
          {botschaft ? "Neu aufnehmen" : "▶ Aufnahme starten"}
        </button>
      )}

      {phase === "countdown" && (
        <div style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", color: A, fontStyle: "italic" }}>Piepton …</div>
      )}

      {phase === "aufnahme" && (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#e05a3a", animation: "blink 1s steps(1) infinite" }} />
            <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.1rem", color: FG, fontVariantNumeric: "tabular-nums" }}>
              {String(Math.floor(sek / 60)).padStart(2, "0")}:{String(sek % 60).padStart(2, "0")} / 01:00
            </span>
          </div>
          <button onClick={stopAufnahme}
            style={{ background: "rgba(220,80,50,0.15)", border: "1px solid rgba(220,80,50,0.5)", borderRadius: "4px", color: "#e05a3a", fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "0.95rem", padding: "0.65rem 1.5rem", cursor: "pointer" }}>
            Aufnahme beenden
          </button>
        </div>
      )}

      {phase === "wiedergabe" && audioBlobUrl && (
        <div>
          <audio controls src={audioBlobUrl} style={{ width: "100%", marginBottom: "1rem" }} />
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={speichern}
              style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1rem", padding: "0.7rem 1.6rem", cursor: "pointer" }}>
              Behalten &amp; Speichern
            </button>
            <button onClick={neu}
              style={{ background: "transparent", border: `1px solid ${am(0.4)}`, borderRadius: "4px", color: fg(0.65), fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.7rem 1.4rem", cursor: "pointer" }}>
              Neu aufnehmen
            </button>
          </div>
        </div>
      )}

      {phase === "speichern" && (
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.6) }}>Wird gespeichert …</div>
      )}
      <style>{`@keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Galerie ──────────────────────────────────────────────────────────────────

function Galerie({ token, fotos, onAdd, onDelete }: {
  token: string;
  fotos: Foto[];
  onAdd: (foto: Foto) => void;
  onDelete: (id: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [bildunterschrift, setBildunterschrift] = useState("");
  const [jahr, setJahr] = useState("");
  const [pendenteFile, setPendenteFile] = useState<File | null>(null);

  const upload = async () => {
    if (!pendenteFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("foto", pendenteFile);
      if (bildunterschrift.trim()) form.append("bildunterschrift", bildunterschrift.trim());
      const j = parseInt(jahr, 10);
      if (!isNaN(j)) form.append("jahr", String(j));
      const res = await fetch(`${BASE}/api/theke/foto/galerie`, {
        method: "POST",
        headers: { "x-theke-token": token },
        body: form,
      });
      const data = await res.json() as { ok?: boolean; foto?: Foto; error?: string };
      if (data.ok && data.foto) {
        onAdd(data.foto);
        setPendenteFile(null);
        setBildunterschrift("");
        setJahr("");
      }
    } catch { }
    setUploading(false);
  };

  const loeschen = async (id: number) => {
    await fetch(`${BASE}/api/theke/foto/${id}`, {
      method: "DELETE",
      headers: { "x-theke-token": token },
    });
    onDelete(id);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {fotos.map(f => (
          <div key={f.id} style={{ position: "relative", borderRadius: "4px", overflow: "hidden", aspectRatio: "1", background: am(0.07) }}>
            <img src={fotoUrl(f.datei_key, token)} alt={f.bildunterschrift ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.75) 0%, transparent 55%)" }} />
            {(f.bildunterschrift || f.jahr) && (
              <div style={{ position: "absolute", bottom: "0.4rem", left: "0.5rem", right: "0.5rem" }}>
                {f.jahr && <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1rem", color: A }}>{f.jahr}</div>}
                {f.bildunterschrift && <div style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", color: fg(0.75), lineHeight: 1.3 }}>{f.bildunterschrift}</div>}
              </div>
            )}
            <button onClick={() => loeschen(f.id)}
              style={{ position: "absolute", top: "0.35rem", right: "0.35rem", background: "rgba(10,7,4,0.75)", border: "none", borderRadius: "3px", color: fg(0.7), fontFamily: "'Lora', serif", fontSize: "0.75rem", padding: "0.2rem 0.5rem", cursor: "pointer" }}>
              ×
            </button>
          </div>
        ))}
        <div onClick={() => inputRef.current?.click()}
          style={{ border: `1px dashed ${am(0.4)}`, borderRadius: "4px", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: am(0.04), gap: "0.4rem" }}>
          <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>+</span>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.4), fontStyle: "italic" }}>Foto hinzufügen</span>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setPendenteFile(f); e.target.value = ""; }} />
      </div>

      {pendenteFile && (
        <div style={{ border: `1px solid ${am(0.35)}`, borderRadius: "6px", padding: "1rem", background: am(0.06), marginBottom: "1rem" }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.7), marginBottom: "0.75rem" }}>{pendenteFile.name}</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <input type="text" placeholder="Bildunterschrift (optional)" value={bildunterschrift} onChange={e => setBildunterschrift(e.target.value)} maxLength={120}
              style={{ flex: 1, minWidth: "160px", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.55rem 0.8rem", outline: "none" }} />
            <input type="number" placeholder="Jahr" value={jahr} onChange={e => setJahr(e.target.value)} min={1940} max={2030}
              style={{ width: "90px", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.55rem 0.8rem", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={upload} disabled={uploading}
              style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "0.95rem", padding: "0.65rem 1.5rem", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}>
              {uploading ? "Lädt …" : "Hochladen"}
            </button>
            <button onClick={() => setPendenteFile(null)}
              style={{ background: "transparent", border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: fg(0.55), fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.65rem 1.2rem", cursor: "pointer" }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Einwilligungen ───────────────────────────────────────────────────────────

function EinwilligungsBlock({ token, profile, onUpdated }: { token: string; profile: Profile; onUpdated: (p: Profile) => void }) {
  const [a, setA] = useState(!!profile.sichtbarkeit_zugestimmt_am);
  const [b, setB] = useState(false);
  const [bEmail, setBEmail] = useState("");
  const [c, setC] = useState(profile.abendfotos_ok);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch(`${BASE}/api/theke/einwilligung`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-theke-token": token },
        body: JSON.stringify({ a, b, b_email: bEmail, c }),
      });
      const data = await res.json() as { ok?: boolean; profile?: Profile };
      if (data.ok && data.profile) { onUpdated(data.profile); setSaved(true); }
    } catch { }
    setSaving(false);
  };

  return (
    <div style={{ border: `1px solid ${am(0.25)}`, borderRadius: "8px", padding: "1.5rem", background: am(0.05) }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "1.25rem" }}>
        Einwilligungen
      </p>

      <label style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "1.1rem", cursor: "pointer" }}>
        <input type="checkbox" checked={a} onChange={e => setA(e.target.checked)}
          style={{ marginTop: "0.2rem", accentColor: A, width: "18px", height: "18px", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.85), lineHeight: 1.65 }}>
          <strong style={{ color: FG }}>Sichtbarkeit &amp; Upload (Pflicht)</strong> — Ich bin damit einverstanden, dass mein Steckbrief, meine Fotos und meine Sprachnachricht für alle anderen Ticketinhaber sichtbar sind. Ohne dieses Häkchen können keine Inhalte hochgeladen und gespeichert werden.
        </span>
      </label>

      <label style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "1.1rem", cursor: "pointer" }}>
        <input type="checkbox" checked={b} onChange={e => setB(e.target.checked)}
          style={{ marginTop: "0.2rem", accentColor: A, width: "18px", height: "18px", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.85), lineHeight: 1.65 }}>
          <strong style={{ color: FG }}>Gelegentliche Infos (optional)</strong> — Ich möchte bei zukünftigen Boomerparty-Aktionen per E-Mail informiert werden (max. 2–3 Mal im Jahr, kein Spam, jederzeit abmeldbar).
        </span>
      </label>
      {b && (
        <input type="email" placeholder="Deine E-Mail-Adresse" value={bEmail} onChange={e => setBEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginLeft: "calc(18px + 0.85rem)", marginBottom: "1.1rem", maxWidth: "340px", background: am(0.07), border: `1px solid ${am(0.35)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.6rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      )}

      <label style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "1.5rem", cursor: "pointer" }}>
        <input type="checkbox" checked={c} onChange={e => setC(e.target.checked)}
          style={{ marginTop: "0.2rem", accentColor: A, width: "18px", height: "18px", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.85), lineHeight: 1.65 }}>
          <strong style={{ color: FG }}>Fotos vom Abend (optional)</strong> — Ich bin damit einverstanden, dass Fotos vom Abend auf denen ich zu sehen bin, in der Theke veröffentlicht werden können.
        </span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={save} disabled={saving}
          style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1rem", padding: "0.75rem 1.8rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Speichern …" : "Speichern"}
        </button>
        {saved && <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fg(0.55) }}>Gespeichert ✓</span>}
      </div>
    </div>
  );
}

// ─── Feed-Karte ───────────────────────────────────────────────────────────────

function FeedKarte({ entry, token, onClick }: { entry: FeedEntry; token: string; onClick: () => void }) {
  const hauptFoto = entry.foto_frueher_key ?? entry.foto_heute_key ?? entry.fotos[0]?.datei_key;
  return (
    <div onClick={onClick} style={{ background: am(0.06), border: `1px solid ${am(0.25)}`, borderRadius: "10px", overflow: "hidden", cursor: "pointer", flexShrink: 0, width: "260px" }}>
      {hauptFoto ? (
        <div style={{ position: "relative", aspectRatio: "3/4", background: BG }}>
          <img src={fotoUrl(hauptFoto, token)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.8) 0%, transparent 55%)" }} />
          {entry.hat_botschaft && (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: am(0.85), borderRadius: "20px", padding: "0.25rem 0.6rem", fontFamily: "'Lora', serif", fontSize: "0.75rem", color: BG, fontWeight: 600 }}>
              🎙
            </div>
          )}
          <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", right: "0.75rem" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.15rem", color: FG, margin: 0, lineHeight: 1.2 }}>{entry.anzeige_name}</p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "1.25rem" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem", color: A, margin: "0 0 0.5rem" }}>{entry.anzeige_name}</p>
          {entry.hat_botschaft && <p style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: fg(0.6) }}>🎙 Hat eine Sprachnachricht hinterlassen</p>}
        </div>
      )}
      <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${am(0.18)}` }}>
        {entry.f_musik && <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.65), margin: "0 0 0.25rem" }}>♪ {entry.f_musik}</p>}
        {entry.f_getraenk && <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.65), margin: 0 }}>🥂 {entry.f_getraenk}</p>}
      </div>
    </div>
  );
}

// ─── Feed-Detail ──────────────────────────────────────────────────────────────

function FeedDetail({ entry, token, onClose }: { entry: FeedEntry; token: string; onClose: () => void }) {
  const botschaftUrl = entry.hat_botschaft ? null : null;
  const [botschaftUrl2, setBotschaftUrl2] = useState<string | null>(null);

  useEffect(() => {
    if (!entry.hat_botschaft) return;
    fetch(`${BASE}/api/theke/band`, { headers: { "x-theke-token": token } })
      .then(r => r.json())
      .then((data: BandEntry[]) => {
        const match = data.find(b => b.anmeldung_ticket_id === entry.anmeldung_ticket_id);
        if (match) setBotschaftUrl2(fotoUrl(match.datei_key, token));
      })
      .catch(() => {});
  }, [entry, token]);

  const felder: [string, string | null | undefined][] = [
    ["Tonträger", entry.f_tontraeger],
    ["Abends", entry.f_abends],
    ["Untersatz", entry.f_untersatz],
    ["Musik heute", entry.f_musik],
    ["Lieblingsgetränk", entry.f_getraenk],
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,7,4,0.9)", overflowY: "auto", padding: "2rem 1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "540px", margin: "0 auto", background: "#100a05", border: `1px solid ${am(0.3)}`, borderRadius: "10px", padding: "2rem", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: fg(0.5), fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}>×</button>

        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.5rem", color: A, marginBottom: "1.25rem" }}>{entry.anzeige_name}</p>

        {(entry.foto_frueher_key || entry.foto_heute_key) && (
          <div style={{ display: "grid", gridTemplateColumns: entry.foto_frueher_key && entry.foto_heute_key ? "1fr 1fr" : "1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {entry.foto_frueher_key && (
              <div style={{ position: "relative", borderRadius: "6px", overflow: "hidden", aspectRatio: "3/4" }}>
                <img src={fotoUrl(entry.foto_frueher_key, token)} alt="Früher" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {entry.foto_frueher_jahr && (
                  <div style={{ position: "absolute", bottom: "0.5rem", left: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.4rem", color: A, textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>{entry.foto_frueher_jahr}</div>
                )}
              </div>
            )}
            {entry.foto_heute_key && (
              <div style={{ position: "relative", borderRadius: "6px", overflow: "hidden", aspectRatio: "3/4" }}>
                <img src={fotoUrl(entry.foto_heute_key, token)} alt="Heute" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {entry.foto_heute_jahr && (
                  <div style={{ position: "absolute", bottom: "0.5rem", left: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.4rem", color: A, textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>{entry.foto_heute_jahr}</div>
                )}
              </div>
            )}
          </div>
        )}

        {entry.vorstellung && (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.95rem", color: fg(0.8), lineHeight: 1.7, borderLeft: `2px solid ${am(0.4)}`, paddingLeft: "0.75rem", marginBottom: "1.25rem" }}>{entry.vorstellung}</p>
        )}

        {botschaftUrl2 && (
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: am(0.8), letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Sprachnachricht</p>
            <audio controls src={botschaftUrl2} style={{ width: "100%" }} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem" }}>
          {felder.filter(([, v]) => v).map(([l, v]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.7), marginBottom: "0.2rem" }}>{l}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.85) }}>{v}</div>
            </div>
          ))}
        </div>
        {entry.lauter_song && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.7), marginBottom: "0.2rem" }}>Lautester Song</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.85) }}>♪ {entry.lauter_song}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Das Band ─────────────────────────────────────────────────────────────────

function DasBand({ token }: { token: string }) {
  const [band, setBand] = useState<BandEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/theke/band`, { headers: { "x-theke-token": token } })
      .then(r => r.json())
      .then((data: BandEntry[]) => { setBand(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.5) }}>Lädt …</p>;
  if (band.length === 0) return <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.45), fontSize: "0.9rem" }}>Noch keine Botschaften hinterlassen.</p>;

  return (
    <div>
      <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.55), marginBottom: "1.25rem" }}>
        {band.length} Botschaft{band.length !== 1 ? "en" : ""} — von allen hörbar:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {band.map(b => (
          <div key={b.id} style={{ border: `1px solid ${am(0.2)}`, borderRadius: "6px", padding: "1rem", background: am(0.05) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1rem", color: A }}>{b.anzeige_name}</span>
              <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.45) }}>{b.dauer_sek}s</span>
            </div>
            <audio controls src={fotoUrl(b.datei_key, token)} style={{ width: "100%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mein Steckbrief ─────────────────────────────────────────────────────────

function MeinSteckbrief({ token, profile, fotos, botschaft, onProfileChange, onFotoAdded, onFotoDeleted, onBotschaftChange }: {
  token: string;
  profile: Profile;
  fotos: Foto[];
  botschaft: Botschaft | null;
  onProfileChange: (p: Profile) => void;
  onFotoAdded: (f: Foto) => void;
  onFotoDeleted: (id: number) => void;
  onBotschaftChange: (b: Botschaft | null) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [local, setLocal] = useState({ ...profile });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (patch: Partial<Profile>) => {
    setLocal(p => ({ ...p, ...patch }));
  };

  const save = useCallback(async () => {
    setSaving(true); setSavedMsg("");
    try {
      const res = await fetch(`${BASE}/api/theke/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-theke-token": token },
        body: JSON.stringify({
          anzeige_name:      local.anzeige_name,
          vorstellung:       local.vorstellung,
          jahr_1985:         local.jahr_1985,
          lauter_song:       local.lauter_song,
          f_tontraeger:      local.f_tontraeger,
          f_abends:          local.f_abends,
          f_untersatz:       local.f_untersatz,
          f_musik:           local.f_musik,
          f_getraenk:        local.f_getraenk,
          foto_frueher_jahr: local.foto_frueher_jahr,
          foto_heute_jahr:   local.foto_heute_jahr,
        }),
      });
      const data = await res.json() as { ok?: boolean; profile?: Profile };
      if (data.ok && data.profile) { onProfileChange(data.profile); setSavedMsg("Gespeichert ✓"); }
    } catch { setSavedMsg("Fehler beim Speichern"); }
    setSaving(false);
  }, [local, token, onProfileChange]);

  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
  }, [save]);

  const uploadFoto = async (slot: "profil-frueher" | "profil-heute", file: File, jahr?: number) => {
    const form = new FormData();
    form.append("foto", file);
    if (jahr) form.append("jahr", String(jahr));
    const res = await fetch(`${BASE}/api/theke/foto/${slot}`, {
      method: "POST",
      headers: { "x-theke-token": token },
      body: form,
    });
    const data = await res.json() as { ok?: boolean; profile?: Profile };
    if (data.ok && data.profile) onProfileChange(data.profile);
  };

  const hatEinwilligung = !!profile.sichtbarkeit_zugestimmt_am;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Anzeigename</span>
        </label>
        <input type="text" value={local.anzeige_name ?? ""} maxLength={80}
          onChange={e => { update({ anzeige_name: e.target.value }); debouncedSave(); }}
          style={{ display: "block", width: "100%", maxWidth: "360px", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "1rem", padding: "0.65rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Kurze Vorstellung (optional)</span>
        </label>
        <textarea value={local.vorstellung ?? ""} maxLength={500} rows={3}
          onChange={e => { update({ vorstellung: e.target.value }); debouncedSave(); }}
          placeholder="Wer bist du? Was magst du? Was bringst du mit?"
          style={{ display: "block", width: "100%", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.65rem 0.9rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Was war 1985 (optional)?</span>
        </label>
        <input type="text" value={local.jahr_1985 ?? ""} maxLength={200}
          onChange={e => { update({ jahr_1985: e.target.value }); debouncedSave(); }}
          placeholder="z.B. ich war 12 und hörte Nena auf Kassette …"
          style={{ display: "block", width: "100%", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.65rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Dein lautester Song damals (optional)</span>
        </label>
        <input type="text" value={local.lauter_song ?? ""} maxLength={200}
          onChange={e => { update({ lauter_song: e.target.value }); debouncedSave(); }}
          placeholder="Titel – Interpret"
          style={{ display: "block", width: "100%", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.65rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <AuswahlFeld label="Lieblingston-Träger früher" opts={TONTRAEGER_OPTS} value={local.f_tontraeger} onChange={v => { update({ f_tontraeger: v }); debouncedSave(); }} />
      <AuswahlFeld label="Damals abends" opts={ABENDS_OPTS} value={local.f_abends} onChange={v => { update({ f_abends: v }); debouncedSave(); }} />
      <AuswahlFeld label="Dein Untersatz" opts={UNTERSATZ_OPTS} value={local.f_untersatz} onChange={v => { update({ f_untersatz: v }); debouncedSave(); }} />
      <AuswahlFeld label="Deine Musik heute" opts={MUSIK_OPTS} value={local.f_musik} onChange={v => { update({ f_musik: v }); debouncedSave(); }} />
      <AuswahlFeld label="Lieblingsgetränk" opts={GETRAENK_OPTS} value={local.f_getraenk} onChange={v => { update({ f_getraenk: v }); debouncedSave(); }} />

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        {savedMsg && <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fg(0.55) }}>{savedMsg}</span>}
        <button onClick={save} disabled={saving}
          style={{ background: A, border: "none", borderRadius: "4px", color: BG, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "0.95rem", padding: "0.65rem 1.5rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Speichern …" : "Speichern"}
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "1.25rem" }}>
          Früher &amp; Heute — Fotos
        </p>
        {!hatEinwilligung && (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: fg(0.5), marginBottom: "1rem" }}>
            Bitte zuerst Einwilligung A setzen (siehe unten), um Fotos hochladen zu können.
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FotoSlot
            label="Früher"
            fileKey={profile.foto_frueher_key}
            jahr={profile.foto_frueher_jahr}
            token={token}
            onUpload={(file, jahr) => hatEinwilligung && uploadFoto("profil-frueher", file, jahr)}
          />
          <FotoSlot
            label="Heute"
            fileKey={profile.foto_heute_key}
            jahr={profile.foto_heute_jahr}
            token={token}
            onUpload={(file, jahr) => hatEinwilligung && uploadFoto("profil-heute", file, jahr)}
          />
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "0.75rem" }}>
          Galerie — weitere Fotos
        </p>
        {!hatEinwilligung ? (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: fg(0.5) }}>Erst Einwilligung A setzen.</p>
        ) : (
          <Galerie token={token} fotos={fotos} onAdd={onFotoAdded} onDelete={onFotoDeleted} />
        )}
      </div>

      <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem", marginBottom: "2rem" }}>
        {!hatEinwilligung ? (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: fg(0.5) }}>Erst Einwilligung A setzen.</p>
        ) : (
          <Anrufbeantworter token={token} botschaft={botschaft} onUploaded={onBotschaftChange} onDeleted={() => onBotschaftChange(null)} />
        )}
      </div>

      <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem" }}>
        <EinwilligungsBlock token={token} profile={profile} onUpdated={onProfileChange} />
      </div>
    </div>
  );
}

// ─── Swipe-Feed ───────────────────────────────────────────────────────────────

function SwipeFeed({ token }: { token: string }) {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailEntry, setDetailEntry] = useState<FeedEntry | null>(null);
  const [suche, setSuche] = useState("");
  const [nurFoto, setNurFoto] = useState(false);
  const [nurBotschaft, setNurBotschaft] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE}/api/theke/feed`, { headers: { "x-theke-token": token } })
      .then(r => r.json())
      .then((data: FeedEntry[]) => { setFeed(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = feed.filter(e => {
    if (suche && !e.anzeige_name.toLowerCase().includes(suche.toLowerCase())) return false;
    if (nurFoto && !e.foto_frueher_key && !e.foto_heute_key && e.fotos.length === 0) return false;
    if (nurBotschaft && !e.hat_botschaft) return false;
    return true;
  });

  if (loading) return <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.5) }}>Lädt …</p>;
  if (feed.length === 0) return (
    <div style={{ padding: "2rem 0", textAlign: "center" }}>
      <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.45) }}>Noch niemand hat sich vorgestellt.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Name suchen …" value={suche} onChange={e => setSuche(e.target.value)}
          style={{ flex: 1, minWidth: "160px", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.55rem 0.8rem", outline: "none" }} />
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
          <input type="checkbox" checked={nurFoto} onChange={e => setNurFoto(e.target.checked)} style={{ accentColor: A }} />
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: fg(0.7) }}>nur mit Foto</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
          <input type="checkbox" checked={nurBotschaft} onChange={e => setNurBotschaft(e.target.checked)} style={{ accentColor: A }} />
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: fg(0.7) }}>nur mit Sprachnachricht</span>
        </label>
      </div>
      <p style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.45), marginBottom: "1rem" }}>{filtered.length} von {feed.length} Gästen</p>
      <div ref={scrollRef} style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
        {filtered.map(e => (
          <div key={e.id} style={{ scrollSnapAlign: "start" }}>
            <FeedKarte entry={e} token={token} onClick={() => setDetailEntry(e)} />
          </div>
        ))}
      </div>
      {detailEntry && <FeedDetail entry={detailEntry} token={token} onClose={() => setDetailEntry(null)} />}
    </div>
  );
}

// ─── Haupt-Theke ──────────────────────────────────────────────────────────────

export default function ThekePage() {
  const [token, setToken] = useState<string | null>(null);
  const [zugangFehler, setZugangFehler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [botschaft, setBotschaft] = useState<Botschaft | null>(null);
  const [needsNameConfirm, setNeedsNameConfirm] = useState(false);
  const [tab, setTab] = useState<"steckbrief" | "feed" | "band">("steckbrief");

  useEffect(() => {
    noindex();
    return () => removeNoindex();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (!t || t.length !== 16) { setZugangFehler(true); setLoading(false); return; }
    const code = t.toUpperCase();
    setToken(code);

    const init = async () => {
      try {
        const res = await fetch(`${BASE}/api/theke/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ t: code }),
        });
        if (!res.ok) { setZugangFehler(true); setLoading(false); return; }
        const data = await res.json() as { ticket: TicketInfo; profile: Profile };
        setTicket(data.ticket);
        setProfile(data.profile);

        if (!data.profile.bestaetigt) {
          setNeedsNameConfirm(true);
        } else {
          await loadMeinProfil(code);
        }
      } catch {
        setZugangFehler(true);
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadMeinProfil = async (code: string) => {
    try {
      const res = await fetch(`${BASE}/api/theke/mein-profil`, { headers: { "x-theke-token": code } });
      const data = await res.json() as { profile: Profile; fotos: Foto[]; botschaft: Botschaft | null };
      setProfile(data.profile);
      setFotos(data.fotos);
      setBotschaft(data.botschaft);
    } catch { }
  };

  const confirmName = async (name: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/api/theke/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, anzeige_name: name }),
      });
      const data = await res.json() as { ticket: TicketInfo; profile: Profile };
      setProfile(data.profile);
      setTicket(data.ticket);
      setNeedsNameConfirm(false);
      await fetch(`${BASE}/api/theke/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-theke-token": token },
        body: JSON.stringify({ anzeige_name: name }),
      });
      const upd = await fetch(`${BASE}/api/theke/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const d2 = await upd.json() as { ticket: TicketInfo; profile: Profile };
      setProfile({ ...d2.profile, bestaetigt: true });
      await loadMeinProfil(token);
    } catch { }
  };

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.5) }}>Die Theke öffnet …</div>
      </div>
    );
  }

  if (zugangFehler) return <Sperrseite />;

  if (needsNameConfirm && ticket) {
    return <NamenseingabeDialog personName={ticket.person_name} onConfirm={confirmName} />;
  }

  if (!profile || !token) return <Sperrseite />;

  const TABS = [
    { id: "steckbrief", label: "Vorher" },
    { id: "feed",       label: "Alle" },
    { id: "band",       label: "Das Band" },
  ] as const;

  const LOCKED_TABS = [
    { id: "abend", label: "Der Abend", sperrtext: "Geht am 18. Juli 2026 online. Bis dahin noch ein bisschen Geduld." },
    { id: "danach", label: "Danach", sperrtext: "Kommt nach dem Abend." },
  ];

  return (
    <div style={{ background: BG, minHeight: "100svh", color: FG }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.25rem 4rem" }}>
        <div style={{ padding: "2rem 0 1.5rem" }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: am(0.7), marginBottom: "0.4rem" }}>
            Die Theke
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.4rem, 5vw, 2rem)", color: A, marginBottom: "0.25rem", lineHeight: 1.15 }}>
            Hallo, {profile.anzeige_name}.
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.5) }}>
            Ticket #{ticket?.ticket_nummer} · nur für Ticketinhaber
          </p>
        </div>

        <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${am(0.2)}`, marginBottom: "2rem", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t.id ? `2px solid ${A}` : "2px solid transparent",
                color: tab === t.id ? A : fg(0.55),
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "1rem",
                padding: "0.7rem 1.25rem",
                cursor: "pointer",
                flexShrink: 0,
                transition: "color 0.15s",
              }}>
              {t.label}
            </button>
          ))}
          {LOCKED_TABS.map(t => (
            <button key={t.id} disabled
              title={t.sperrtext}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "2px solid transparent",
                color: fg(0.25),
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "1rem",
                padding: "0.7rem 1.25rem",
                cursor: "not-allowed",
                flexShrink: 0,
              }}>
              {t.label} 🔒
            </button>
          ))}
        </div>

        {tab === "steckbrief" && (
          <MeinSteckbrief
            token={token}
            profile={profile}
            fotos={fotos}
            botschaft={botschaft}
            onProfileChange={p => setProfile(p)}
            onFotoAdded={f => setFotos(fs => [f, ...fs])}
            onFotoDeleted={id => setFotos(fs => fs.filter(f => f.id !== id))}
            onBotschaftChange={b => setBotschaft(b)}
          />
        )}
        {tab === "feed" && <SwipeFeed token={token} />}
        {tab === "band" && <DasBand token={token} />}

        <div style={{ marginTop: "3rem", padding: "1.5rem 0", borderTop: `1px solid ${am(0.12)}` }}>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: fg(0.3), textAlign: "center" }}>
            EMMERICH BOOMT! · 18. Juli 2026 · Nur für Ticketinhaber · <a href={`${BASE}/`} style={{ color: am(0.5), textDecoration: "none" }}>Zur Startseite</a>
          </p>
        </div>
      </div>
    </div>
  );
}
