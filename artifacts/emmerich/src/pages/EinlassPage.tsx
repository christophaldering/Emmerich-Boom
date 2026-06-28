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
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = 220;
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now); osc.stop(now + 0.40);
    } else {
      const osc     = ctx.createOscillator();
      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain    = ctx.createGain();
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 900;
      lfo.type = "sine"; lfo.frequency.value = 4;
      lfoGain.gain.value = 300;
      gain.gain.setValueAtTime(0.40, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      lfo.start(now); osc.start(now);
      lfo.stop(now + 1.5); osc.stop(now + 1.55);
    }
  } catch { /* Ignore */ }
}

function vibrate(type: "success" | "error" | "duplicate", enabled: boolean): void {
  if (!enabled) return;
  try {
    if (!navigator.vibrate) return;
    if (type === "success") navigator.vibrate(100);
    else if (type === "error") navigator.vibrate(300);
    else navigator.vibrate([100, 80, 100, 80, 200]);
  } catch { /* Ignore */ }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const ADMIN_PW       = "#Boomer2026";
const PW_KEY         = "emmerich_admin_auth";
const SCANNER_KEY    = "emmerich_scanner_name";
const SECRET         = "emmerich-orga-stats-2026";
const VIBRATION_KEY  = "emmerich_vibration_feedback";
const AUTO_RESTART_MS = 3500;

// ── Types ─────────────────────────────────────────────────────────────────────
type ScanResult =
  | { status: "ok";           personName: string; message: string }
  | { status: "already_used"; personName: string; message: string; usedAt: string }
  | { status: "invalid";      message: string }
  | { status: "error";        message: string };

type EingelassenRow = {
  id: number;
  ticket_code: string;
  ticket_nummer: string | null;
  person_name: string;
  eingelassen_am: string;
  scanner_name: string | null;
};

// ── Login-Gate ────────────────────────────────────────────────────────────────
function LoginGate({ onAuth }: { onAuth: (scannerName: string) => void }) {
  const [pw, setPw]               = useState("");
  const [name, setName]           = useState("");
  const [pwError, setPwError]     = useState(false);
  const [nameError, setNameError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameOk = name.trim().length > 0;
    setNameError(!nameOk);
    setPwError(false);
    setAuthMsg("");
    if (!nameOk) return;
    setAuthLoading(true);
    try {
      const r = await fetch(`${API}/einlass/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password: pw }),
      });
      const data = await r.json() as { ok: boolean; scanner_name?: string; message?: string };
      if (data.ok && data.scanner_name) {
        sessionStorage.setItem(PW_KEY, "1");
        sessionStorage.setItem(SCANNER_KEY, data.scanner_name);
        onAuth(data.scanner_name);
      } else {
        setPwError(true);
        setAuthMsg(data.message ?? "Unbekannter Scanner oder falsches Passwort.");
      }
    } catch {
      setAuthMsg("Verbindungsfehler. Bitte nochmal versuchen.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      {/* Poster-Hintergrund */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "url(/images/boomerpartyposter.jpeg) center center / cover no-repeat" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(10,7,4,0.42) 0%, rgba(10,7,4,0.32) 40%, rgba(10,7,4,0.55) 100%)" }} />

      <form onSubmit={handleSubmit} style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "320px" }}>
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.6rem", color: "#e8991a", margin: "0 0 0.2rem", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            Emmerich boomt!
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,232,200,0.4)", margin: "0 0 0.75rem", letterSpacing: "0.06em" }}>
            18. Juli 2026 · Bölt · Kapaunenberg
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(245,232,200,0.5)", margin: 0 }}>
            Bitte Namen und Passwort eingeben.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={labelStyle}>Dein Name / Station</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError(false); }}
            placeholder="z.B. Klaus · Eingang Nord"
            autoFocus
            style={inputStyle(nameError)}
          />
          {nameError && <p style={errorStyle}>Bitte einen Namen eingeben.</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={labelStyle}>Passwort</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            placeholder="Passwort"
            style={inputStyle(pwError)}
          />
          {pwError && <p style={errorStyle}>{authMsg || "Unbekannter Scanner oder falsches Passwort."}</p>}
        </div>

        {authMsg && !pwError && <p style={{ ...errorStyle, color: "#e74c3c" }}>{authMsg}</p>}

        <button type="submit" disabled={authLoading} style={btnStyle("#e8991a", "0.75rem")}>
          {authLoading ? "Prüfe …" : "Scanner starten"}
        </button>
      </form>
    </div>
  );
}

// ── API ───────────────────────────────────────────────────────────────────────
async function sendScan(code: string, scannerName: string): Promise<ScanResult> {
  try {
    const r = await fetch(`${API}/ticket/${code}/scan`, {
      method: "POST",
      headers: {
        "x-admin-secret":  SECRET,
        "x-scanner-name":  scannerName,
      },
    });
    return await r.json();
  } catch {
    return { status: "error", message: "Verbindungsfehler" };
  }
}

// ── Result-Overlay (fullscreen) ───────────────────────────────────────────────
function ResultOverlay({
  result,
  countdown,
  onNext,
}: {
  result: ScanResult;
  countdown: number;
  onNext: () => void;
}) {
  const isOk  = result.status === "ok";
  const isDup = result.status === "already_used";

  const bgColor    = isOk ? "#012b0a" : isDup ? "#2b1500" : "#2b0101";
  const borderColor= isOk ? "#2ecc71" : isDup ? "#e8991a" : "#e74c3c";
  const emoji      = isOk ? "✅" : isDup ? "⚠️" : "❌";
  const label      = isOk
    ? "Einlass OK"
    : isDup
    ? "Bereits eingelöst"
    : "Ungültiges Ticket";

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: bgColor,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "1.25rem",
      padding: "2rem",
      zIndex: 100,
    }}>
      <div style={{ fontSize: "6rem", lineHeight: 1 }}>{emoji}</div>

      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: "1rem",
        letterSpacing: "0.12em",
        color: borderColor,
        margin: 0,
        textTransform: "uppercase",
      }}>{label}</p>

      {"personName" in result && (
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "clamp(1.4rem, 6vw, 2.2rem)",
          color: "#f5e8c8",
          textAlign: "center",
          margin: 0,
          maxWidth: "90%",
        }}>{result.personName}</p>
      )}

      {isDup && "usedAt" in result && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "rgba(245,232,200,0.5)", margin: 0, fontStyle: "italic" }}>
          Eingelöst um {new Date(result.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
        </p>
      )}

      {result.status === "invalid" || result.status === "error" ? (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "rgba(245,232,200,0.55)", margin: 0, fontStyle: "italic" }}>
          {result.message}
        </p>
      ) : null}

      {/* Auto-restart counter */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button onClick={onNext} style={btnStyle(borderColor, "0.9rem 2.5rem")}>
          Nächsten scannen
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(245,232,200,0.35)", margin: 0 }}>
          Startet automatisch in {countdown} s …
        </p>
      </div>
    </div>
  );
}

// ── Eingelassen-Tabelle ───────────────────────────────────────────────────────
function EingelassenTabelle({ refreshTrigger }: { refreshTrigger: number }) {
  const [rows, setRows]       = useState<EingelassenRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

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
    const id = setInterval(() => { void load(); }, 20_000);
    return () => clearInterval(id);
  }, [load]);

  // Unique scanner names for the legend
  const scanners = Array.from(new Set(rows.map(r => r.scanner_name).filter(Boolean) as string[]));

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center",
          background: "rgba(245,232,200,0.04)",
          border: "1px solid rgba(245,232,200,0.10)",
          borderRadius: "6px",
          padding: "0.7rem 1rem",
          color: "#e8991a",
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        <span>Eingelassen {rows.length > 0 ? `(${rows.length})` : ""}</span>
        <span style={{ fontSize: "0.75rem", color: "rgba(232,153,26,0.55)", fontStyle: "normal" }}>
          {loading ? "…" : open ? "▲ schließen" : "▼ anzeigen"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {rows.length === 0 && !loading && (
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.35)", textAlign: "center", margin: "0.5rem 0" }}>
              Noch niemand eingelassen.
            </p>
          )}

          {/* Scanner legend */}
          {scanners.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
              {scanners.map((s, i) => (
                <span key={s} style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.72rem",
                  background: `${SCANNER_COLORS[i % SCANNER_COLORS.length]}22`,
                  border: `1px solid ${SCANNER_COLORS[i % SCANNER_COLORS.length]}66`,
                  color: SCANNER_COLORS[i % SCANNER_COLORS.length],
                  borderRadius: "3px",
                  padding: "0.15rem 0.5rem",
                }}>{s}</span>
              ))}
            </div>
          )}

          {rows.map(row => {
            const si = scanners.indexOf(row.scanner_name ?? "");
            const scannerColor = si >= 0 ? SCANNER_COLORS[si % SCANNER_COLORS.length] : "rgba(245,232,200,0.25)";
            return (
              <div key={row.ticket_code} style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr auto",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(245,232,200,0.03)",
                borderRadius: "4px",
                padding: "0.5rem 0.75rem",
                border: "1px solid rgba(245,232,200,0.08)",
              }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", color: "rgba(245,232,200,0.4)" }}>
                  {new Date(row.eingelassen_am).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "#f5e8c8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.person_name}
                  {row.ticket_nummer && (
                    <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "rgba(232,153,26,0.5)", marginLeft: "0.4rem" }}>#{row.ticket_nummer}</span>
                  )}
                </span>
                {row.scanner_name && (
                  <span style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.68rem",
                    color: scannerColor,
                    border: `1px solid ${scannerColor}55`,
                    borderRadius: "3px",
                    padding: "0.1rem 0.4rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>{row.scanner_name}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SCANNER_COLORS = ["#e8991a", "#5bc8af", "#c87dd4", "#6ab0e8", "#e87a5b"];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EinlassPage() {
  const [scannerName, setScannerName] = useState<string>(() => sessionStorage.getItem(SCANNER_KEY) ?? "");
  const [authed, setAuthed]           = useState(() => sessionStorage.getItem(PW_KEY) === "1" && !!sessionStorage.getItem(SCANNER_KEY));
  const [vibrationEnabled, setVibration] = useState(() => localStorage.getItem(VIBRATION_KEY) !== "0");

  const [scanning, setScanning]   = useState(false);
  const [result, setResult]       = useState<ScanResult | null>(null);
  const [countdown, setCountdown] = useState(Math.round(AUTO_RESTART_MS / 1000));
  const [camError, setCamError]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number | null>(null);
  const cooldownRef = useRef(false);
  const lastTickRef = useRef<number>(0);
  const autoTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopScan = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  const clearAutoTimers = () => {
    if (autoTimerRef.current)  { clearTimeout(autoTimerRef.current);   autoTimerRef.current  = null; }
    if (countdownRef.current)  { clearInterval(countdownRef.current);  countdownRef.current  = null; }
  };

  const tick = (now: number = 0) => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    // Throttle: scan only every 150 ms to reduce CPU/heat
    if (now - lastTickRef.current < 150) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastTickRef.current = now;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code && !cooldownRef.current) {
      cooldownRef.current = true;
      const raw        = code.data.trim();
      const match      = raw.match(/\/boomer-orga-intern\/ticket\/([A-F0-9]{16})/i);
      const ticketCode = match ? match[1].toUpperCase() : raw.toUpperCase();
      stopScan();
      setLoading(true);
      sendScan(ticketCode, scannerName).then(r => {
        setResult(r);
        setLoading(false);
        setRefreshTrigger(n => n + 1);
        const feedbackType = r.status === "ok" ? "success" : r.status === "already_used" ? "duplicate" : "error";
        playSound(feedbackType);
        vibrate(feedbackType, vibrationEnabled);
        startAutoRestart();
      });
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const startScan = async () => {
    setCamError("");
    setResult(null);
    cooldownRef.current = false;
    clearAutoTimers();
    setCountdown(Math.round(AUTO_RESTART_MS / 1000));
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

  const startAutoRestart = () => {
    clearAutoTimers();
    let secs = Math.round(AUTO_RESTART_MS / 1000);
    setCountdown(secs);
    countdownRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
    }, 1000);
    autoTimerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      void startScan();
    }, AUTO_RESTART_MS);
  };

  const handleNext = () => {
    clearAutoTimers();
    void startScan();
  };

  // Auto-start camera after login
  useEffect(() => {
    if (authed) void startScan();
    return () => { stopScan(); clearAutoTimers(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const toggleVibration = () => {
    setVibration(prev => {
      const next = !prev;
      localStorage.setItem(VIBRATION_KEY, next ? "1" : "0");
      return next;
    });
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!authed) {
    return (
      <LoginGate onAuth={name => { setScannerName(name); setAuthed(true); }} />
    );
  }

  const A = "#E8991A";

  return (
    <div style={{
      minHeight: "100svh",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes scanline {
          0%   { top: 12%; opacity: 1; }
          48%  { opacity: 1; }
          50%  { top: 88%; opacity: 0.4; }
          52%  { opacity: 1; }
          100% { top: 12%; opacity: 1; }
        }
        @keyframes puls-ring {
          0%,100% { box-shadow: 0 0 0 0   rgba(232,153,26,0.55),
                                0 0 18px 2px rgba(232,153,26,0.18); }
          50%     { box-shadow: 0 0 0 6px rgba(232,153,26,0.15),
                                0 0 30px 6px rgba(232,153,26,0.28); }
        }
      `}</style>

      {/* ── Poster-Hintergrund ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "url(/images/boomerpartyposter.jpeg) center center / cover no-repeat",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(10,7,4,0.42) 0%, rgba(10,7,4,0.32) 40%, rgba(10,7,4,0.55) 100%)",
      }} />

      {/* Result overlay */}
      {result && !loading && (
        <ResultOverlay result={result} countdown={countdown} onNext={handleNext} />
      )}

      {/* ── Hauptinhalt ── */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: "440px",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "2rem 1.25rem 1.5rem",
        gap: "1.25rem",
      }}>

        {/* ── Header-Zeile ── */}
        <div style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          {/* Titel + Name */}
          <div>
            <p style={{
              fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              fontSize: "1.5rem", color: A, margin: "0 0 0.15rem",
              textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            }}>
              Emmerich boomt!
            </p>
            <p style={{
              fontFamily: "'Lora', serif", fontSize: "0.72rem",
              color: "rgba(245,232,200,0.55)",
              margin: "0 0 0.3rem", letterSpacing: "0.04em",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
            }}>
              18. Juli 2026 · Bölt
            </p>
            <span style={{
              fontFamily: "'Lora', serif", fontSize: "0.72rem",
              color: "rgba(232,153,26,0.75)",
              background: "rgba(10,7,4,0.45)",
              border: "1px solid rgba(232,153,26,0.28)",
              borderRadius: "3px", padding: "0.15rem 0.55rem",
              backdropFilter: "blur(4px)",
            }}>
              {scannerName}
            </span>
          </div>

          {/* Einstellungen-Icon */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              style={{
                background: settingsOpen ? "rgba(232,153,26,0.18)" : "rgba(10,7,4,0.45)",
                border: `1px solid ${settingsOpen ? "rgba(232,153,26,0.5)" : "rgba(245,232,200,0.2)"}`,
                borderRadius: "8px",
                color: settingsOpen ? A : "rgba(245,232,200,0.6)",
                width: "2.4rem", height: "2.4rem",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(6px)",
              }}
              title="Einstellungen"
            >
              ⚙
            </button>

            {settingsOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 0.5rem)", right: 0,
                background: "rgba(14,10,5,0.92)",
                border: "1px solid rgba(232,153,26,0.22)",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                minWidth: "210px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                zIndex: 10,
                display: "flex", flexDirection: "column", gap: "0.6rem",
              }}>
                {/* Vibration */}
                <button
                  onClick={toggleVibration}
                  style={{
                    background: "transparent",
                    border: `1px solid ${vibrationEnabled ? "rgba(232,153,26,0.4)" : "rgba(245,232,200,0.12)"}`,
                    borderRadius: "6px",
                    color: vibrationEnabled ? "rgba(232,153,26,0.85)" : "rgba(245,232,200,0.35)",
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: "0.82rem",
                    padding: "0.45rem 0.75rem",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <span>📳</span>
                  Vibration {vibrationEnabled ? "an" : "aus"}
                </button>

                {/* Manuelle Eingabe */}
                <ManualEntry onScanned={() => { setRefreshTrigger(n => n + 1); setSettingsOpen(false); }} vibrationEnabled={vibrationEnabled} scannerName={scannerName} />

                {/* Trennlinie + Abmelden */}
                <div style={{ borderTop: "1px solid rgba(245,232,200,0.08)", paddingTop: "0.5rem" }}>
                  <button
                    onClick={() => { sessionStorage.removeItem(PW_KEY); sessionStorage.removeItem(SCANNER_KEY); stopScan(); setAuthed(false); }}
                    style={{ background: "transparent", border: "none", color: "rgba(245,232,200,0.3)", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", cursor: "pointer", padding: 0 }}
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Kamera-Karte ── */}
        <div style={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          background: "#000",
          boxShadow: scanning
            ? "0 0 0 2px #E8991A, 0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(232,153,26,0.25)"
            : "0 0 0 1px rgba(232,153,26,0.25), 0 8px 40px rgba(0,0,0,0.7)",
          animation: scanning ? "puls-ring 2.5s ease-in-out infinite" : "none",
          flexShrink: 0,
          aspectRatio: "4/3",
        }}>
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: scanning ? 1 : 0.2 }}
            playsInline muted autoPlay
          />

          {/* Ecken-Dekor */}
          {scanning && (() => {
            const corner = (pos: React.CSSProperties): React.ReactNode => (
              <div style={{
                position: "absolute", width: "28px", height: "28px",
                borderColor: A, borderStyle: "solid", borderWidth: "0",
                ...pos,
              }} />
            );
            const s = "3px solid " + A;
            return (
              <>
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
                  {/* TL */}
                  <div style={{ position: "absolute", top: "14%", left: "14%", width: "28px", height: "28px", borderTop: s, borderLeft: s, borderRadius: "4px 0 0 0" }} />
                  {/* TR */}
                  <div style={{ position: "absolute", top: "14%", right: "14%", width: "28px", height: "28px", borderTop: s, borderRight: s, borderRadius: "0 4px 0 0" }} />
                  {/* BL */}
                  <div style={{ position: "absolute", bottom: "14%", left: "14%", width: "28px", height: "28px", borderBottom: s, borderLeft: s, borderRadius: "0 0 0 4px" }} />
                  {/* BR */}
                  <div style={{ position: "absolute", bottom: "14%", right: "14%", width: "28px", height: "28px", borderBottom: s, borderRight: s, borderRadius: "0 0 4px 0" }} />

                  {/* Scan-Linie */}
                  <div style={{
                    position: "absolute", left: "14%", right: "14%",
                    height: "2px",
                    background: `linear-gradient(to right, transparent, ${A}, transparent)`,
                    animation: "scanline 2s ease-in-out infinite",
                    borderRadius: "1px",
                    boxShadow: `0 0 8px 2px rgba(232,153,26,0.5)`,
                  }} />

                  {/* Vignette */}
                  <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)", borderRadius: "16px" }} />
                </div>
              </>
            );
          })()}

          {!scanning && !loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: `rgba(245,232,200,0.4)`, margin: 0 }}>
                Kamera bereit
              </p>
            </div>
          )}
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
              <p style={{ fontFamily: "'Lora', serif", color: A, fontStyle: "italic", margin: 0, fontSize: "1rem" }}>
                Prüfe Ticket…
              </p>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {camError && (
          <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#e74c3c", textAlign: "center", margin: 0 }}>
            {camError}
          </p>
        )}

        {/* Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {!scanning && (
            <button onClick={() => void startScan()} style={{
              background: `rgba(232,153,26,0.12)`,
              border: `1.5px solid ${A}`,
              borderRadius: "8px",
              color: A,
              padding: "0.85rem",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1.05rem",
              cursor: "pointer",
              width: "100%",
              boxShadow: "0 4px 16px rgba(232,153,26,0.15)",
              backdropFilter: "blur(4px)",
            }}>
              {camError ? "Nochmal versuchen" : "Kamera starten & scannen"}
            </button>
          )}
          {scanning && (
            <button onClick={stopScan} style={{
              background: "rgba(245,232,200,0.06)",
              border: "1px solid rgba(245,232,200,0.2)",
              borderRadius: "8px",
              color: `rgba(245,232,200,0.45)`,
              padding: "0.6rem",
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "0.82rem",
              cursor: "pointer",
              width: "100%",
              backdropFilter: "blur(4px)",
            }}>
              Pause
            </button>
          )}
        </div>

        <div style={{ width: "100%", borderTop: "1px solid rgba(245,232,200,0.07)", marginTop: "0.25rem" }} />

        <EingelassenTabelle refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

// ── Manual Entry ──────────────────────────────────────────────────────────────
function ManualEntry({ onScanned, vibrationEnabled, scannerName }: { onScanned: () => void; vibrationEnabled: boolean; scannerName: string }) {
  const [open, setOpen]     = useState(false);
  const [code, setCode]     = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const r = await sendScan(code.trim(), scannerName);
    setResult(r);
    setLoading(false);
    onScanned();
    const feedbackType = r.status === "ok" ? "success" : r.status === "already_used" ? "duplicate" : "error";
    playSound(feedbackType);
    vibrate(feedbackType, vibrationEnabled);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(245,232,200,0.3)", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
      Code manuell eingeben
    </button>
  );

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }}
          placeholder="XXXXXXXXXXXXXXXX"
          maxLength={16}
          style={{ flex: 1, background: "rgba(245,232,200,0.07)", border: "1px solid rgba(245,232,200,0.2)", borderRadius: "3px", color: "#f5e8c8", padding: "0.6rem 0.75rem", fontSize: "0.9rem", fontFamily: "monospace", outline: "none", letterSpacing: "0.1em" }}
        />
        <button type="submit" disabled={loading} style={btnStyle("#e8991a", "0.6rem 1rem", true)}>Prüfen</button>
      </form>
      {result && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: result.status === "ok" ? "#2ecc71" : result.status === "already_used" ? "#e8991a" : "#e74c3c", marginTop: "0.5rem", textAlign: "center" }}>
          {"personName" in result ? `${result.personName} — ` : ""}{result.message}
        </p>
      )}
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
function btnStyle(color: string, padding = "0.75rem", inline = false): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${color}`,
    borderRadius: "5px",
    color,
    padding,
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1rem",
    cursor: "pointer",
    width: inline ? "auto" : "100%",
  };
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    background: "rgba(245,232,200,0.07)",
    border: `1px solid ${hasError ? "#e8991a" : "rgba(245,232,200,0.2)"}`,
    borderRadius: "3px",
    color: "#f5e8c8",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontFamily: "'Lora', serif",
    outline: "none",
  };
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: "0.8rem",
  color: "rgba(245,232,200,0.5)",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontStyle: "italic",
  fontSize: "0.82rem",
  color: "#e8991a",
  margin: 0,
};
