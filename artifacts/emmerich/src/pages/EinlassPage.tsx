import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// ── Web Audio Feedback ────────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  return _audioCtx;
}

function playSound(type: "success" | "error" | "duplicate"): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;

    if (type === "success") {
      // Three ascending sine tones: C5 → E5 → G5
      ([
        [523, 0.00],
        [659, 0.13],
        [784, 0.26],
      ] as [number, number][]).forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        const t = now + delay;
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc.start(t); osc.stop(t + 0.12);
      });

    } else if (type === "error") {
      // Short sawtooth burst ~220 Hz
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = 220;
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now); osc.stop(now + 0.40);

    } else {
      // Siren: LFO-modulated sine 600–1200 Hz over 1.5 s
      const osc     = ctx.createOscillator();
      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain    = ctx.createGain();
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 900;
      lfo.type = "sine"; lfo.frequency.value = 4;
      lfoGain.gain.value = 300;        // ±300 Hz → 600–1200 Hz range
      gain.gain.setValueAtTime(0.40, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      lfo.start(now); osc.start(now);
      lfo.stop(now + 1.5); osc.stop(now + 1.55);
    }
  } catch {
    // Ignore — audio not available in this context
  }
}

function vibrate(type: "success" | "error" | "duplicate", enabled: boolean): void {
  if (!enabled) return;
  try {
    if (!navigator.vibrate) return;
    if (type === "success") navigator.vibrate(100);
    else if (type === "error") navigator.vibrate(300);
    else navigator.vibrate([100, 80, 100, 80, 200]);
  } catch {
    // Ignore — vibration not supported in this context
  }
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const ADMIN_PW = "#Boomer2026";
const PW_KEY = "emmerich_admin_auth";
const SECRET = "emmerich-orga-stats-2026";
const VIBRATION_KEY = "emmerich_vibration_feedback";

type ScanResult =
  | { status: "ok"; personName: string; message: string }
  | { status: "already_used"; personName: string; message: string; usedAt: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

type EingelassenRow = {
  id: number;
  ticket_code: string;
  ticket_nummer: string | null;
  person_name: string;
  eingelassen_am: string;
};

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PW) { sessionStorage.setItem(PW_KEY, "1"); onAuth(); }
    else { setError(true); setInput(""); }
  };
  return (
    <div style={{ minHeight: "100svh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "320px" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.2rem", color: "#e8991a", textAlign: "center" }}>Einlass-Scanner</p>
        <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }} placeholder="Passwort" autoFocus
          style={{ background: "rgba(245,232,200,0.07)", border: `1px solid ${error ? "#e8991a" : "rgba(245,232,200,0.2)"}`, borderRadius: "3px", color: "#f5e8c8", padding: "0.75rem 1rem", fontSize: "1rem", fontFamily: "'Lora', serif", outline: "none" }} />
        {error && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: "#e8991a", textAlign: "center", margin: 0 }}>Falsches Passwort.</p>}
        <button type="submit" style={{ background: "transparent", border: "1px solid #e8991a", borderRadius: "3px", color: "#e8991a", padding: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", cursor: "pointer" }}>Weiter</button>
      </form>
    </div>
  );
}

async function sendScan(code: string): Promise<ScanResult> {
  try {
    const r = await fetch(`${API}/ticket/${code}/scan`, {
      method: "POST",
      headers: { "x-admin-secret": SECRET },
    });
    return await r.json();
  } catch {
    return { status: "error", message: "Verbindungsfehler" };
  }
}


function EingelassenTabelle({ refreshTrigger }: { refreshTrigger: number }) {
  const [rows, setRows] = useState<EingelassenRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/eingelassen`, { headers: { "x-admin-secret": SECRET } });
      if (r.ok) setRows(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshTrigger]);

  useEffect(() => {
    const id = setInterval(() => { void load(); }, 30_000);
    return () => clearInterval(id);
  }, [load]);

  if (rows.length === 0 && !loading) return (
    <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.35)", textAlign: "center", marginTop: "0.5rem" }}>
      Noch niemand eingelassen.
    </p>
  );

  return (
    <div style={{ width: "100%", maxWidth: "480px", marginTop: "0.5rem" }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", color: "#e8991a", marginBottom: "0.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Eingelassen ({rows.length})</span>
        {loading && <span style={{ fontSize: "0.75rem", color: "rgba(232,153,26,0.55)" }}>…</span>}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {rows.map(row => (
          <div key={`${row.ticket_code}`} style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            background: "rgba(245,232,200,0.04)", borderRadius: "4px",
            padding: "0.55rem 0.75rem",
            border: "1px solid rgba(245,232,200,0.09)",
          }}>
            <span style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", color: "rgba(245,232,200,0.45)", minWidth: "3.2rem", flexShrink: 0 }}>
              {new Date(row.eingelassen_am).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "#f5e8c8", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.person_name}
            </span>
            {row.ticket_nummer && (
              <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(232,153,26,0.55)", flexShrink: 0 }}>
                #{row.ticket_nummer}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default function EinlassPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(PW_KEY) === "1");
  const [vibrationEnabled, setVibrationEnabled] = useState(() => localStorage.getItem(VIBRATION_KEY) !== "0");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [camError, setCamError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const toggleVibration = () => {
    setVibrationEnabled(prev => {
      const next = !prev;
      localStorage.setItem(VIBRATION_KEY, next ? "1" : "0");
      return next;
    });
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);

  const stopScan = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code && !cooldownRef.current) {
      cooldownRef.current = true;
      const raw = code.data.trim();
      const match = raw.match(/\/boomer-orga-intern\/ticket\/([A-F0-9]{16})/i);
      const ticketCode = match ? match[1].toUpperCase() : raw.toUpperCase();
      stopScan();
      setLoading(true);
      sendScan(ticketCode).then(r => {
        setResult(r);
        setLoading(false);
        setRefreshTrigger(n => n + 1);
        const feedbackType = r.status === "ok" ? "success" : r.status === "already_used" ? "duplicate" : "error";
        playSound(feedbackType);
        vibrate(feedbackType, vibrationEnabled);
      });
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startScan = async () => {
    setCamError("");
    setResult(null);
    cooldownRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("muted", "true");
      await video.play();
      setScanning(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setCamError("Kamera-Zugriff verweigert. Bitte in den Einstellungen erlauben.");
      } else {
        setCamError("Kamera konnte nicht gestartet werden.");
      }
    }
  };

  useEffect(() => () => { stopScan(); }, []);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const bgColor =
    result?.status === "ok" ? "#061a0a" :
    result?.status === "already_used" ? "#1a0e03" :
    result?.status === "invalid" || result?.status === "error" ? "#1a0303" :
    "#0a0704";

  return (
    <div style={{ minHeight: "100svh", background: bgColor, display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem", transition: "background 0.35s" }}>

      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.3rem", color: "#e8991a", margin: 0 }}>
        Einlass-Scanner
      </p>

      {/* Video viewport */}
      <div style={{
        width: "100%", maxWidth: "360px",
        aspectRatio: "4/3",
        borderRadius: "8px",
        overflow: "hidden",
        border: `2px solid ${scanning ? "#e8991a" : "rgba(232,153,26,0.25)"}`,
        background: "#000",
        position: "relative",
        display: scanning ? "block" : "none",
      }}>
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          playsInline
          muted
          autoPlay
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: "200px", height: "200px", border: "2px solid rgba(232,153,26,0.7)", borderRadius: "8px", boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)" }} />
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Result */}
      {result && !loading && (
        <div style={{
          width: "100%", maxWidth: "360px",
          borderRadius: "8px",
          border: `2px solid ${result.status === "ok" ? "#2ecc71" : result.status === "already_used" ? "#e8991a" : "#e74c3c"}`,
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "3rem", margin: "0 0 0.5rem" }}>
            {result.status === "ok" ? "✅" : result.status === "already_used" ? "⚠️" : "❌"}
          </p>
          {"personName" in result && (
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: "#f5e8c8", margin: "0 0 0.4rem" }}>
              {result.personName}
            </p>
          )}
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "#f5e8c8", margin: "0 0 0.3rem" }}>
            {result.message}
          </p>
          {result.status === "already_used" && (
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.55)", margin: 0 }}>
              Eingelöst um {new Date(result.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
            </p>
          )}
        </div>
      )}

      {loading && (
        <p style={{ fontFamily: "'Lora', serif", color: "#e8991a", fontStyle: "italic" }}>Prüfe Ticket…</p>
      )}

      {camError && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#e74c3c", textAlign: "center", maxWidth: "320px" }}>
          {camError}
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "360px" }}>
        {!scanning && !result && (
          <button onClick={startScan} style={btn("#e8991a")}>
            Kamera starten &amp; scannen
          </button>
        )}
        {scanning && (
          <button onClick={stopScan} style={btn("rgba(245,232,200,0.4)")}>
            Abbrechen
          </button>
        )}
        {result && !scanning && (
          <button onClick={() => { setResult(null); startScan(); }} style={btn("#e8991a")}>
            Nächsten scannen
          </button>
        )}
      </div>

      <ManualEntry onScanned={() => setRefreshTrigger(n => n + 1)} vibrationEnabled={vibrationEnabled} />

      {/* Vibrations-Toggle */}
      <button
        onClick={toggleVibration}
        style={{
          background: "transparent",
          border: `1px solid ${vibrationEnabled ? "rgba(232,153,26,0.5)" : "rgba(245,232,200,0.15)"}`,
          borderRadius: "3px",
          color: vibrationEnabled ? "rgba(232,153,26,0.8)" : "rgba(245,232,200,0.3)",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.78rem",
          padding: "0.3rem 0.75rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
        title="Vibrations-Feedback ein-/ausschalten"
      >
        <span style={{ fontSize: "0.9rem" }}>📳</span>
        Vibration {vibrationEnabled ? "an" : "aus"}
      </button>

      {/* Divider */}
      <div style={{ width: "100%", maxWidth: "480px", borderTop: "1px solid rgba(245,232,200,0.08)", marginTop: "0.5rem" }} />

      {/* Eingelassen-Tabelle */}
      <EingelassenTabelle refreshTrigger={refreshTrigger} />

    </div>
  );
}

function ManualEntry({ onScanned, vibrationEnabled }: { onScanned: () => void; vibrationEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const r = await sendScan(code.trim());
    setResult(r);
    setLoading(false);
    onScanned();
    const feedbackType = r.status === "ok" ? "success" : r.status === "already_used" ? "duplicate" : "error";
    playSound(feedbackType);
    vibrate(feedbackType, vibrationEnabled);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(245,232,200,0.35)", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
      Code manuell eingeben
    </button>
  );

  return (
    <div style={{ width: "100%", maxWidth: "360px" }}>
      <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem" }}>
        <input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }} placeholder="XXXXXXXXXXXXXXXX" maxLength={16}
          style={{ flex: 1, background: "rgba(245,232,200,0.07)", border: "1px solid rgba(245,232,200,0.2)", borderRadius: "3px", color: "#f5e8c8", padding: "0.6rem 0.75rem", fontSize: "0.9rem", fontFamily: "monospace", outline: "none", letterSpacing: "0.1em" }} />
        <button type="submit" disabled={loading} style={btn("#e8991a", "0.6rem 1rem")}>Prüfen</button>
      </form>
      {result && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: result.status === "ok" ? "#2ecc71" : result.status === "already_used" ? "#e8991a" : "#e74c3c", marginTop: "0.5rem", textAlign: "center" }}>
          {"personName" in result ? `${result.personName} — ` : ""}{result.message}
        </p>
      )}
    </div>
  );
}

function btn(color: string, padding = "0.75rem"): React.CSSProperties {
  return { background: "transparent", border: `1px solid ${color}`, borderRadius: "4px", color, padding, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", cursor: "pointer", width: "100%" };
}
