import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { THEKE_SZENE } from "../config/theke-szene";

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
  zuletzt_gesehen_am?: string | null;
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
  return `/api/theke/datei/${key}?t=${encodeURIComponent(token)}`;
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

// ─── Foto-Slot ────────────────────────────────────────────────────────────────

function FotoSlot({ label, fileKey, jahr, token, onUpload, accept = "image/*", disabled = false }: {
  label: string; fileKey?: string | null; jahr?: number | null;
  token: string; onUpload: (file: File, jahr?: number) => void; accept?: string; disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jahrInput, setJahrInput] = useState(String(jahr ?? ""));

  return (
    <div style={{ position: "relative", background: am(0.07), border: `1px solid ${am(0.25)}`, borderRadius: "6px", overflow: "hidden", aspectRatio: "3/4", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}
      onClick={() => !disabled && inputRef.current?.click()}>
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
    } catch {
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
      const res = await fetch(`/api/theke/audio`, {
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
    try {
      const res = await fetch(`/api/theke/audio/${botschaft.id}`, {
        method: "DELETE",
        headers: { "x-theke-token": token },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? "Löschen fehlgeschlagen."); return;
      }
      onDeleted();
    } catch {
      setError("Verbindungsfehler beim Löschen.");
    }
  };

  const botschaftUrl = botschaft ? `/api/theke/datei/${botschaft.datei_key}?t=${encodeURIComponent(token)}` : null;

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
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#e05a3a", animation: "thekeBlink 1s steps(1) infinite" }} />
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
  const [uploadMsg, setUploadMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const upload = async () => {
    if (!pendenteFile) return;
    setUploading(true);
    setUploadMsg({ text: "Foto wird hochgeladen …", ok: true });
    try {
      const form = new FormData();
      form.append("foto", pendenteFile);
      if (bildunterschrift.trim()) form.append("bildunterschrift", bildunterschrift.trim());
      const j = parseInt(jahr, 10);
      if (!isNaN(j)) form.append("jahr", String(j));
      const res = await fetch(`/api/theke/foto/galerie`, {
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
        setUploadMsg({ text: "Foto hochgeladen ✓", ok: true });
        setTimeout(() => setUploadMsg(null), 3000);
      } else {
        setUploadMsg({ text: data.error ?? "Upload fehlgeschlagen.", ok: false });
      }
    } catch {
      setUploadMsg({ text: "Verbindungsfehler beim Hochladen.", ok: false });
    }
    setUploading(false);
  };

  const loeschen = async (id: number) => {
    await fetch(`/api/theke/foto/${id}`, {
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
            <button onClick={() => { setPendenteFile(null); setUploadMsg(null); }}
              style={{ background: "transparent", border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: fg(0.55), fontFamily: "'Lora', serif", fontSize: "0.9rem", padding: "0.65rem 1.2rem", cursor: "pointer" }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {uploadMsg && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", fontStyle: "italic", color: uploadMsg.ok ? "rgba(232,153,26,0.9)" : "#e05252", margin: "0.6rem 0 0" }}>
          {uploadMsg.text}
        </p>
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
      const res = await fetch(`/api/theke/einwilligung`, {
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

// ─── Feed-Detail ──────────────────────────────────────────────────────────────

function FeedDetail({ entry, token, onClose }: { entry: FeedEntry; token: string; onClose: () => void }) {
  const [botschaftUrl2, setBotschaftUrl2] = useState<string | null>(null);

  useEffect(() => {
    if (!entry.hat_botschaft) return;
    fetch(`/api/theke/band`, { headers: { "x-theke-token": token } })
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

// ─── Mein Steckbrief ──────────────────────────────────────────────────────────

interface MeinSteckbriefHandle { flush: () => Promise<void>; }

const MeinSteckbrief = forwardRef<MeinSteckbriefHandle, {
  token: string;
  profile: Profile;
  fotos: Foto[];
  botschaft: Botschaft | null;
  onProfileChange: (p: Profile) => void;
  onFotoAdded: (f: Foto) => void;
  onFotoDeleted: (id: number) => void;
  onBotschaftChange: (b: Botschaft | null) => void;
}>(function MeinSteckbrief({ token, profile, fotos, botschaft, onProfileChange, onFotoAdded, onFotoDeleted, onBotschaftChange }, ref) {
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [fotoMsg, setFotoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [local, setLocal] = useState({ ...profile });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInProgressRef = useRef(false);
  const localRef = useRef(local);
  localRef.current = local;

  const update = (patch: Partial<Profile>) => {
    setLocal(p => ({ ...p, ...patch }));
  };

  const save = useCallback(async () => {
    if (saveInProgressRef.current) return;
    saveInProgressRef.current = true;
    setSaving(true); setSavedMsg("");
    try {
      const res = await fetch(`/api/theke/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-theke-token": token },
        body: JSON.stringify({
          anzeige_name:      localRef.current.anzeige_name,
          vorstellung:       localRef.current.vorstellung,
          jahr_1985:         localRef.current.jahr_1985,
          lauter_song:       localRef.current.lauter_song,
          f_tontraeger:      localRef.current.f_tontraeger,
          f_abends:          localRef.current.f_abends,
          f_untersatz:       localRef.current.f_untersatz,
          f_musik:           localRef.current.f_musik,
          f_getraenk:        localRef.current.f_getraenk,
          foto_frueher_jahr: localRef.current.foto_frueher_jahr,
          foto_heute_jahr:   localRef.current.foto_heute_jahr,
        }),
      });
      const data = await res.json() as { ok?: boolean; profile?: Profile };
      if (data.ok && data.profile) { onProfileChange(data.profile); setSavedMsg("Gespeichert ✓"); }
      else { setSavedMsg("Konnte nicht gespeichert werden"); }
    } catch { setSavedMsg("Konnte nicht gespeichert werden"); }
    setSaving(false);
    saveInProgressRef.current = false;
  }, [token, onProfileChange]);

  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
  }, [save]);

  const flushSave = useCallback(async () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    await save();
  }, [save]);

  useImperativeHandle(ref, () => ({ flush: flushSave }), [flushSave]);

  useEffect(() => {
    return () => { if (saveTimer.current) { clearTimeout(saveTimer.current); void save(); } };
  }, [save]);

  const uploadFoto = async (slot: "profil-frueher" | "profil-heute", file: File, jahr?: number) => {
    setFotoMsg({ text: "Foto wird hochgeladen …", ok: true });
    try {
      const form = new FormData();
      form.append("foto", file);
      if (jahr) form.append("jahr", String(jahr));
      const res = await fetch(`/api/theke/foto/${slot}`, {
        method: "POST",
        headers: { "x-theke-token": token },
        body: form,
      });
      const data = await res.json() as { ok?: boolean; profile?: Profile; error?: string };
      if (data.ok && data.profile) {
        onProfileChange(data.profile);
        setFotoMsg({ text: "Foto gespeichert ✓", ok: true });
        setTimeout(() => setFotoMsg(null), 3000);
      } else {
        setFotoMsg({ text: data.error ?? "Foto konnte nicht gespeichert werden.", ok: false });
      }
    } catch {
      setFotoMsg({ text: "Foto konnte nicht gespeichert werden.", ok: false });
    }
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
          onBlur={flushSave}
          style={{ display: "block", width: "100%", maxWidth: "360px", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "1rem", padding: "0.65rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Kurze Vorstellung (optional)</span>
        </label>
        <textarea value={local.vorstellung ?? ""} maxLength={500} rows={3}
          onChange={e => { update({ vorstellung: e.target.value }); debouncedSave(); }}
          onBlur={flushSave}
          placeholder="Wer bist du? Was magst du? Was bringst du mit?"
          style={{ display: "block", width: "100%", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.65rem 0.9rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Was war 1985 (optional)?</span>
        </label>
        <input type="text" value={local.jahr_1985 ?? ""} maxLength={200}
          onChange={e => { update({ jahr_1985: e.target.value }); debouncedSave(); }}
          onBlur={flushSave}
          placeholder="z.B. ich war 12 und hörte Nena auf Kassette …"
          style={{ display: "block", width: "100%", background: am(0.07), border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: FG, fontFamily: "'Lora', serif", fontSize: "0.95rem", padding: "0.65rem 0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.8) }}>Dein lautester Song damals (optional)</span>
        </label>
        <input type="text" value={local.lauter_song ?? ""} maxLength={200}
          onChange={e => { update({ lauter_song: e.target.value }); debouncedSave(); }}
          onBlur={flushSave}
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
        <EinwilligungsBlock token={token} profile={profile} onUpdated={onProfileChange} />
      </div>

      <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "1.25rem" }}>
          Früher &amp; Heute — Fotos
        </p>
        {!hatEinwilligung && (
          <div style={{ background: "rgba(232,153,26,0.08)", border: "1px solid rgba(232,153,26,0.3)", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: fg(0.8), margin: 0 }}>
              Setze zuerst das Häkchen <em>„Sichtbarkeit &amp; Upload"</em> oben — dann sind die Upload-Felder aktiv.
            </p>
          </div>
        )}
        {fotoMsg && (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fotoMsg.ok ? am(0.9) : "#e05252", marginBottom: "0.75rem" }}>
            {fotoMsg.text}
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FotoSlot
            label="Früher"
            fileKey={profile.foto_frueher_key}
            jahr={profile.foto_frueher_jahr}
            token={token}
            disabled={!hatEinwilligung}
            onUpload={(file, jahr) => uploadFoto("profil-frueher", file, jahr)}
          />
          <FotoSlot
            label="Heute"
            fileKey={profile.foto_heute_key}
            jahr={profile.foto_heute_jahr}
            token={token}
            disabled={!hatEinwilligung}
            onUpload={(file, jahr) => uploadFoto("profil-heute", file, jahr)}
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
    </div>
  );
});

// ─── Das Band ─────────────────────────────────────────────────────────────────

function DasBand({ token }: { token: string }) {
  const [band, setBand] = useState<BandEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/theke/band`, { headers: { "x-theke-token": token } })
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

// ─── Porträt-Rahmen (kein Flip — Bild kommt nach vorn) ───────────────────────

function PorträtRahmen({ entry, token, anwesend, rotation, onFokus }: {
  entry: FeedEntry;
  token: string;
  anwesend: boolean;
  rotation: number;
  onFokus: (e: FeedEntry) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hauptFoto = entry.foto_heute_key ?? entry.foto_frueher_key;
  const initials = entry.anzeige_name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";

  return (
    <div
      onClick={() => onFokus(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: "clamp(80px, 18vw, 130px)",
        aspectRatio: "3/4",
        position: "relative",
        cursor: "pointer",
        transform: `rotate(${rotation}deg) scale(${hovered ? 1.06 : 1})`,
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        userSelect: "none",
      }}
    >
      {/* Rahmen */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, borderRadius: "2px",
        border: `6px solid ${anwesend ? "#c8941a" : "#4a3308"}`,
        boxShadow: anwesend
          ? `0 6px 22px rgba(0,0,0,0.9), 0 0 20px rgba(232,153,26,0.4), inset 0 0 0 1px rgba(232,153,26,0.2)`
          : `0 6px 22px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(0,0,0,0.5)`,
        pointerEvents: "none",
        animation: anwesend ? "thekeGlow 2.8s ease-in-out infinite" : "none",
      }} />
      {/* Porträt */}
      <div style={{ position: "absolute", inset: "6px", overflow: "hidden", borderRadius: "1px" }}>
        {hauptFoto ? (
          <>
            <img src={fotoUrl(hauptFoto, token)} alt={entry.anzeige_name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                filter: anwesend ? "brightness(1)" : "brightness(0.6) sepia(0.15)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.82) 0%, transparent 55%)" }} />
          </>
        ) : (
          <div style={{ width: "100%", height: "100%", background: A, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1rem, 3.5vw, 1.6rem)", color: BG, letterSpacing: "0.04em" }}>
              {initials}
            </span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: "0.35rem", left: "0.35rem", right: "0.35rem", zIndex: 4 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.62rem", color: FG, margin: 0, lineHeight: 1.2, textShadow: "0 1px 5px rgba(0,0,0,0.95)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {entry.anzeige_name}
          </p>
          {entry.hat_botschaft && <span style={{ fontSize: "0.55rem", color: am(0.9) }}>🎙</span>}
        </div>
        {anwesend && (
          <div style={{ position: "absolute", top: "0.35rem", right: "0.35rem", width: "7px", height: "7px", borderRadius: "50%", background: A, animation: "thekePuls 2.5s ease-in-out infinite", zIndex: 4 }} />
        )}
      </div>
    </div>
  );
}

// ─── Porträt-Streifen (Wand) ──────────────────────────────────────────────────

function PorträtStreifen({ feed, token, now, onFokus }: {
  feed: FeedEntry[];
  token: string;
  now: number;
  onFokus: (e: FeedEntry) => void;
}) {
  if (feed.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 1rem" }}>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: fg(0.45), fontSize: "0.82rem", textAlign: "center", textShadow: "0 1px 8px rgba(0,0,0,0.95)" }}>
          Noch niemand an der Wand. Richte deinen Steckbrief ein.
        </p>
      </div>
    );
  }
  return (
    <div style={{
      display: "flex", gap: "clamp(0.75rem, 2.5vw, 1.75rem)",
      alignItems: "flex-end", padding: "0.5rem 1rem 1.5rem",
      overflowX: "auto", overflowY: "visible", height: "100%",
      WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      {feed.map((e, i) => {
        const rot = (((e.id * 3 + i * 7) % 9) - 4) * 0.85;
        const anwesend = !!(e.zuletzt_gesehen_am && (now - new Date(e.zuletzt_gesehen_am).getTime()) < 90_000);
        return <PorträtRahmen key={e.id} entry={e} token={token} anwesend={anwesend} rotation={rot} onFokus={onFokus} />;
      })}
    </div>
  );
}

// ─── Bierdeckel-Objekt ────────────────────────────────────────────────────────

function BierdeckelObjekt({ name, onClick }: { name: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "clamp(90px, 20vw, 148px)",
        aspectRatio: "1",
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 35% 30%, #f5e8c8 0%, #e8d4a0 45%, #c8ad6e 100%)",
        border: "none",
        boxShadow: hovered
          ? `0 8px 26px rgba(0,0,0,0.85), 0 0 18px rgba(232,153,26,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`
          : `0 6px 20px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.2)`,
        cursor: "pointer",
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.2rem",
        transform: `scale(${hovered ? 1.07 : 1}) rotate(${hovered ? 2 : 0}deg)`,
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
        padding: "1rem 0.75rem",
        outline: "none",
      }}
    >
      <div style={{ position: "absolute", inset: "10px", borderRadius: "50%", border: "1px solid rgba(139,100,15,0.3)", pointerEvents: "none" }} />
      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(0.68rem, 2.2vw, 0.9rem)", color: "#3d2a04", lineHeight: 1.2, textAlign: "center", position: "relative", zIndex: 1 }}>
        {name}
      </span>
      <span style={{ fontFamily: "'Lora', serif", fontSize: "0.58rem", color: "rgba(61,42,4,0.6)", fontStyle: "italic", position: "relative", zIndex: 1 }}>
        Mein Steckbrief
      </span>
    </button>
  );
}

// ─── Telefon-Objekt ───────────────────────────────────────────────────────────

function TelefonObjekt({ bandCount, onClick }: { bandCount: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const hat = bandCount > 0;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "clamp(70px, 15vw, 110px)",
        aspectRatio: "2/3",
        borderRadius: "10px 10px 16px 16px",
        background: "linear-gradient(160deg, #2a1a0a 0%, #1a0e05 55%, #120b03 100%)",
        border: `2px solid ${hat ? am(0.7) : am(0.25)}`,
        boxShadow: hovered || hat
          ? `0 8px 24px rgba(0,0,0,0.88), 0 0 22px ${am(0.35)}`
          : `0 6px 20px rgba(0,0,0,0.75)`,
        cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.35rem",
        animation: hat ? "telefonBlink 3.5s ease-in-out infinite" : "none",
        transform: `scale(${hovered ? 1.07 : 1})`,
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
        padding: "0.75rem 0.5rem",
        outline: "none",
      }}
    >
      <div style={{ width: "45%", height: "3px", borderRadius: "2px", background: hat ? am(0.6) : am(0.18), marginBottom: "0.3rem" }} />
      {hat && <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: A, animation: "thekePuls 1.8s ease-in-out infinite" }} />}
      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(0.6rem, 1.8vw, 0.78rem)", color: hat ? A : fg(0.45), lineHeight: 1.3, textAlign: "center", whiteSpace: "pre-line" }}>
        {hat ? `${bandCount} ${bandCount === 1 ? "Nachricht" : "Nachrichten"}` : "Anruf-\nbeantworter"}
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 7px)", gap: "3px", marginTop: "0.2rem" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: am(0.14), border: `1px solid ${am(0.2)}` }} />
        ))}
      </div>
    </button>
  );
}

// ─── Profil-Overlay (Bierdeckel) ──────────────────────────────────────────────

function ProfilOverlay({ token, profile, fotos, botschaft, onClose, onProfileChange, onFotoAdded, onFotoDeleted, onBotschaftChange }: {
  token: string;
  profile: Profile;
  fotos: Foto[];
  botschaft: Botschaft | null;
  onClose: () => void;
  onProfileChange: (p: Profile) => void;
  onFotoAdded: (f: Foto) => void;
  onFotoDeleted: (id: number) => void;
  onBotschaftChange: (b: Botschaft | null) => void;
}) {
  const steckbriefRef = useRef<MeinSteckbriefHandle>(null);
  const handleClose = useCallback(async () => {
    await steckbriefRef.current?.flush();
    onClose();
  }, [onClose]);

  return (
    <div
      onClick={handleClose}
      style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(10,7,4,0.88)", overflowY: "auto" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "640px", margin: "0 auto", minHeight: "100svh",
          background: "linear-gradient(to bottom, #110a03 0%, #0a0704 100%)",
          borderLeft: `1px solid ${am(0.18)}`, borderRight: `1px solid ${am(0.18)}`,
          padding: "0 1.5rem 4rem",
        }}
      >
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: "linear-gradient(to bottom, #110a03 80%, transparent 100%)", padding: "1.25rem 0 0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: am(0.6), margin: 0 }}>Dein Steckbrief</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.25rem", color: A, margin: 0, lineHeight: 1.2 }}>
              {profile.anzeige_name}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "transparent", border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: fg(0.55), fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem", cursor: "pointer" }}>
            Schließen
          </button>
        </div>
        <MeinSteckbrief
          ref={steckbriefRef}
          token={token}
          profile={profile}
          fotos={fotos}
          botschaft={botschaft}
          onProfileChange={onProfileChange}
          onFotoAdded={onFotoAdded}
          onFotoDeleted={onFotoDeleted}
          onBotschaftChange={onBotschaftChange}
        />
      </div>
    </div>
  );
}

// ─── Telefon-Overlay ──────────────────────────────────────────────────────────

function TelefonOverlay({ token, botschaft, onClose, onBotschaftChange }: {
  token: string;
  botschaft: Botschaft | null;
  onClose: () => void;
  onBotschaftChange: (b: Botschaft | null) => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(10,7,4,0.88)", overflowY: "auto" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "640px", margin: "0 auto", minHeight: "100svh",
          background: "linear-gradient(to bottom, #110a03 0%, #0a0704 100%)",
          borderLeft: `1px solid ${am(0.18)}`, borderRight: `1px solid ${am(0.18)}`,
          padding: "0 1.5rem 4rem",
        }}
      >
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: "linear-gradient(to bottom, #110a03 80%, transparent 100%)", padding: "1.25rem 0 0.75rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: am(0.6), margin: 0 }}>Das Band</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.25rem", color: A, margin: 0, lineHeight: 1.2 }}>
              Sprachnachrichten
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: `1px solid ${am(0.3)}`, borderRadius: "4px", color: fg(0.55), fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem", cursor: "pointer" }}>
            Schließen
          </button>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <DasBand token={token} />
        </div>

        <div style={{ borderTop: `1px solid ${am(0.15)}`, paddingTop: "2rem" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "0.75rem" }}>
            Deine Nachricht
          </p>
          <Anrufbeantworter
            token={token}
            botschaft={botschaft}
            onUploaded={onBotschaftChange}
            onDeleted={() => onBotschaftChange(null)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Haupt-Theke (Szene) ──────────────────────────────────────────────────────

export default function ThekePage() {
  const [token, setToken] = useState<string | null>(null);
  const [zugangFehler, setZugangFehler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [botschaft, setBotschaft] = useState<Botschaft | null>(null);
  const [needsNameConfirm, setNeedsNameConfirm] = useState(false);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [feedNow, setFeedNow] = useState(Date.now());
  const [selectedEntry, setSelectedEntry] = useState<FeedEntry | null>(null);
  const [bierdeckelOffen, setBierdeckelOffen] = useState(false);
  const [telefonOffen, setTelefonOffen] = useState(false);
  const [bandCount, setBandCount] = useState(0);
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  useEffect(() => {
    noindex();
    return () => removeNoindex();
  }, []);

  // Parallax (Maus + Geräteneigung)
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const lowPerf = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4;
    const factor = lowPerf ? 0.4 : 1;
    let rafId = 0;
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      setTiltX(curX);
      setTiltY(curY);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    const onMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 14 * factor;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 10 * factor;
    };
    const onOrientation = (e: DeviceOrientationEvent) => {
      targetX = Math.max(-7, Math.min(7, ((e.gamma ?? 0) / 45) * 7 * factor));
      targetY = Math.max(-5, Math.min(5, ((e.beta ?? 0) / 90) * 5 * factor));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (!t || t.length !== 16) { setZugangFehler(true); setLoading(false); return; }
    const code = t.toUpperCase();
    setToken(code);

    const init = async () => {
      try {
        const res = await fetch(`/api/theke/auth`, {
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
      const res = await fetch(`/api/theke/mein-profil`, { headers: { "x-theke-token": code } });
      const data = await res.json() as { profile: Profile; fotos: Foto[]; botschaft: Botschaft | null };
      setProfile(data.profile);
      setFotos(data.fotos);
      setBotschaft(data.botschaft);
    } catch { }
  };

  const confirmName = async (name: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/theke/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, anzeige_name: name }),
      });
      const data = await res.json() as { ticket: TicketInfo; profile: Profile };
      setProfile(data.profile);
      setTicket(data.ticket);
      setNeedsNameConfirm(false);
      await fetch(`/api/theke/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-theke-token": token },
        body: JSON.stringify({ anzeige_name: name }),
      });
      const upd = await fetch(`/api/theke/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const d2 = await upd.json() as { ticket: TicketInfo; profile: Profile };
      setProfile({ ...d2.profile, bestaetigt: true });
      await loadMeinProfil(token);
    } catch { }
  };

  // Feed laden
  useEffect(() => {
    if (!token) return;
    const load = () => {
      fetch(`/api/theke/feed`, { headers: { "x-theke-token": token } })
        .then(r => r.json())
        .then((data: FeedEntry[]) => { setFeed(data); setFeedNow(Date.now()); })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [token]);

  // Band-Anzahl laden (für Telefon-Blink)
  useEffect(() => {
    if (!token) return;
    fetch(`/api/theke/band`, { headers: { "x-theke-token": token } })
      .then(r => r.json())
      .then((data: BandEntry[]) => setBandCount(data.length))
      .catch(() => {});
  }, [token]);

  // Präsenz-Ping alle 25 Sekunden
  useEffect(() => {
    if (!token) return;
    const ping = () => fetch(`/api/theke/ping`, {
      method: "POST",
      headers: { "x-theke-token": token },
    }).catch(() => {});
    ping();
    const id = setInterval(ping, 25_000);
    return () => clearInterval(id);
  }, [token]);

  // Anwesend-Zähler aktuell halten
  useEffect(() => {
    const id = setInterval(() => setFeedNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

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

  const anwesendCount = feed.filter(e => e.zuletzt_gesehen_am && (feedNow - new Date(e.zuletzt_gesehen_am).getTime()) < 90_000).length;

  const W = THEKE_SZENE.WALL_REGION;
  const B = THEKE_SZENE.BAR_REGION;

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, overflow: "hidden", touchAction: "pan-x" }}>
      <style>{`
        @keyframes thekePuls { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.78)} }
        @keyframes thekeGlow { 0%,100%{box-shadow:0 6px 22px rgba(0,0,0,0.9),0 0 14px rgba(232,153,26,0.28)} 50%{box-shadow:0 6px 22px rgba(0,0,0,0.9),0 0 26px rgba(232,153,26,0.55)} }
        @keyframes telefonBlink { 0%,70%,100%{opacity:1} 80%,90%{opacity:0.28} }
        .porträt-streifen::-webkit-scrollbar { display: none; }
      `}</style>


      {/* ── Backdrop (Kulissenbild) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: backdropFailed
            ? "linear-gradient(180deg, #0a0704 0%, #1c0e05 45%, #2a1508 65%, #150a03 100%)"
            : `center/cover no-repeat url(${THEKE_SZENE.BACKDROP_URL})`,
          transform: `translate(${-tiltX * 0.3}px, ${-tiltY * 0.25}px) scale(1.05)`,
        }}
      >
        {!backdropFailed && (
          <img src={THEKE_SZENE.BACKDROP_URL} alt="" onError={() => setBackdropFailed(true)} style={{ display: "none" }} />
        )}
      </div>

      {/* Tiefengradienten: Decke + Boden abdunkeln */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(10,7,4,0.55) 0%, rgba(10,7,4,0) 22%, rgba(10,7,4,0) 52%, rgba(10,7,4,0.72) 80%, rgba(10,7,4,0.92) 100%)" }} />

      {/* ── Grußzeile (oben, über Backdrop) ── */}
      <div style={{
        position: "absolute", top: "max(1.25rem, env(safe-area-inset-top, 0px))", left: 0, right: 0,
        zIndex: 10, textAlign: "center", padding: "0 1rem", pointerEvents: "none",
      }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic",
          fontSize: "clamp(1rem, 3.8vw, 1.6rem)", color: A, margin: 0,
          textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 0 40px rgba(10,7,4,0.7)" }}>
          Schön, dass du da bist, {profile.anzeige_name}.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: A, animation: "thekePuls 2.5s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem",
            color: fg(0.62), textShadow: "0 1px 8px rgba(0,0,0,0.95)" }}>
            {anwesendCount > 0
              ? `${anwesendCount} ${anwesendCount === 1 ? "Person" : "Personen"} gerade an der Theke`
              : "Du bist der Erste heute"}
          </span>
        </div>
      </div>

      {/* ── Wand-Region: Porträtrahmen (horizontal scrollbar) ── */}
      <div
        style={{
          position: "absolute",
          top: `${W.top}%`, left: `${W.left}%`,
          width: `${W.width}%`, height: `${W.height}%`,
          zIndex: 3,
          transform: `translate(${-tiltX * 0.55}px, ${-tiltY * 0.45}px)`,
          filter: "blur(0.35px)",
          overflow: "visible",
        }}
      >
        <PorträtStreifen feed={feed} token={token} now={feedNow} onFokus={setSelectedEntry} />
      </div>

      {/* ── Tresen-Region: Bierdeckel + Telefon (scharf, vorne) ── */}
      <div
        style={{
          position: "absolute",
          top: `${B.top}%`, left: `${B.left}%`,
          width: `${B.width}%`, height: `${B.height}%`,
          zIndex: 5,
          transform: `translate(${-tiltX * 1.0}px, ${-tiltY * 0.85}px)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "clamp(1.5rem, 6vw, 5rem)",
        }}
      >
        <BierdeckelObjekt name={profile.anzeige_name} onClick={() => setBierdeckelOffen(true)} />
        <TelefonObjekt bandCount={bandCount} onClick={() => setTelefonOffen(true)} />
      </div>

      {/* ── Phasen-Andeutungen (unten, ambient) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          left: 0, right: 0, zIndex: 4,
          display: "flex", justifyContent: "center", gap: "3rem",
          pointerEvents: "none",
        }}
      >
        {/* Geschlossene Tür: Der Abend */}
        <div style={{ textAlign: "center", opacity: 0.38 }}>
          <div style={{ width: "28px", height: "38px", margin: "0 auto 0.35rem",
            border: `1.5px solid ${am(0.4)}`, borderRadius: "14px 14px 0 0",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: am(0.55) }} />
          </div>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.62rem", color: fg(0.38), margin: 0 }}>Der Abend</p>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.54rem", color: fg(0.22), margin: 0 }}>18. Juli 2026</p>
        </div>
        {/* Uhr: Danach */}
        <div style={{ textAlign: "center", opacity: 0.25 }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%",
            border: `1.5px solid ${am(0.3)}`, margin: "0 auto 0.35rem",
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: "1.5px", height: "9px", background: am(0.45),
              bottom: "50%", left: "50%", transformOrigin: "bottom center",
              transform: "translateX(-50%) rotate(-45deg)" }} />
            <div style={{ position: "absolute", width: "1.5px", height: "6px", background: am(0.35),
              bottom: "50%", left: "50%", transformOrigin: "bottom center",
              transform: "translateX(-50%) rotate(90deg)" }} />
          </div>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.62rem", color: fg(0.25), margin: 0 }}>Danach</p>
        </div>
      </div>

      {/* ── Startseiten-Link ── */}
      <div style={{ position: "absolute", bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))", right: "1rem", zIndex: 6 }}>
        <a href={`${BASE}/`} style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.65rem", color: am(0.32), textDecoration: "none" }}>
          Zur Startseite
        </a>
      </div>

      {/* ── Overlays ── */}

      {selectedEntry && (
        <FeedDetail entry={selectedEntry} token={token} onClose={() => setSelectedEntry(null)} />
      )}

      {bierdeckelOffen && profile && (
        <ProfilOverlay
          token={token}
          profile={profile}
          fotos={fotos}
          botschaft={botschaft}
          onClose={() => setBierdeckelOffen(false)}
          onProfileChange={p => setProfile(p)}
          onFotoAdded={f => setFotos(fs => [f, ...fs])}
          onFotoDeleted={id => setFotos(fs => fs.filter(f => f.id !== id))}
          onBotschaftChange={b => setBotschaft(b)}
        />
      )}

      {telefonOffen && (
        <TelefonOverlay
          token={token}
          botschaft={botschaft}
          onClose={() => setTelefonOffen(false)}
          onBotschaftChange={b => { setBotschaft(b); setBandCount(n => b ? n + 1 : Math.max(0, n - 1)); }}
        />
      )}
    </div>
  );
}
